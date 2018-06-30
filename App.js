import React, { Component } from 'react';
import { AppState, View, StyleSheet, StatusBar, Platform } from 'react-native';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { persistStore, persistReducer, createTransform } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createSwitchNavigator, createDrawerNavigator } from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

import WHSApp from './src/reducers/reducer';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Settings from './src/screens/Settings';
import DrawerContent from './src/components/DrawerContent';
import { fetchUserInfo, setProfilePhoto, setDayInfo } from './src/actions/actionCreators';
import { selectSchedule } from './src/util/querySchedule';
import reportError from './src/util/reportError';

// This transform is needed to rehydrate dates as moment objects
const transformMoments = createTransform(
  inboundState => inboundState,
  (outboundState) => {
    const copy = { ...outboundState };
    Object.keys(copy).forEach((key) => {
      const value = copy[key];
      /* eslint-disable-next-line no-underscore-dangle */
      if (value && !Array.isArray(value) && moment(value)._isValid) {
        copy[key] = moment(value);
      }
    });
    return copy;
  },
  { whitelist: ['specialDates', 'dayInfo'] },
);
const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['profilePhoto', 'loginError'],
  transforms: [transformMoments],
};
const persistedReducer = persistReducer(persistConfig, WHSApp);
const store = createStore(
  persistedReducer,
  applyMiddleware(
    thunk,
    createLogger(),
  ),
);
const persistor = persistStore(store);

// Set global moment locale
moment.updateLocale('en', {
  week: { dow: 1 },
});
momentDurationFormat(moment);

const hasLoggedIn = () => {
  const { username, password } = store.getState();
  return username && password;
};

export default class App extends Component {
  state = { loaded: false }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = (newStatus) => {
    /**
     * This handler handles the case where the user does not quit the app but has it in the
     * background, in which case the app does some updates when they refocus the app
     */
    const { dayInfo: { lastUpdate } } = store.getState();
    const now = moment();
    const today = now.day();
    if (
      newStatus === 'active'
      && lastUpdate.isSame(now, 'day') // Only update if not updated in one day
      && today !== 0 && today < 6 // Ignores global locale, 0 is Sun, 6 is Sat
    ) {
      this.updateDayInfo(now); // Pass already created instance
    }
  }

  handleRehydrate = async () => {
    // This runs some preload manual rehydrating and calculating after auto rehydrate
    if (hasLoggedIn()) {
      try {
        const {
          specialDates: { semesterOneStart, semesterTwoStart, lastDay },
          refreshedSemesterOne,
          refreshedSemesterTwo,
          username,
          password,
        } = store.getState();
        const now = moment();

        if (now.isAfter(semesterTwoStart) && now.isBefore(lastDay) && !refreshedSemesterTwo) {
          // If in semester two and has not refreshed, refresh info
          store.dispatch(fetchUserInfo(username, password));
        } else if (
          now.isAfter(semesterOneStart) && now.isBefore(semesterTwoStart)
          && !refreshedSemesterOne
        ) {
          // If in semester one and has not refreshed, refresh info
          store.dispatch(fetchUserInfo(username, password));
        } else if (now.isAfter(lastDay.clone().add(2, 'months'))) {
          /**
           * If two months after last day, refresh
           * The third argument bypasses the semesterOneStart < now < semesterTwoStart check
           * because if someone opens up the app >two months after last school year's last day
           * (i.e. August 1st) and it refreshes, it should not refresh on the first day
           */
          store.dispatch(fetchUserInfo(username, password, true));
        }

        this.updateDayInfo(now);
        // Since next line is async, must wait for it or else state will be set before it finishes
        await this.updateProfilePhoto();
      } catch (error) {
        const { settings: { errorReporting } } = store.getState();
        reportError(
          'Something went wrong reloading your information. Please try restarting the app.',
          error,
          errorReporting,
        );
        return;
      }
    }
    this.setState({ loaded: true });
  }

  updateDayInfo = (date = moment()) => {
    const { specialDates } = store.getState();
    const schedule = selectSchedule(specialDates, date);
    const range = [
      schedule[0][0],
      schedule.slice(-1)[0][1],
    ].map(time => moment(`${time}:00`, 'k:mm:ss'));
    // TODO: Implement break/summer checking here (last 2 args to setDayInfo)
    store.dispatch(setDayInfo(...range, schedule, date, false, false));
  }

  updateProfilePhoto = async () => {
    /**
     * Explicit blacklist from store rehydration and manual getting
     * of profile photo gets rid of profile photo collision when
     * more than two people login on the same device
     */
    const { username, schoolPicture } = store.getState();
    const profilePhoto = await storage.getItem(`${username}:profilePhoto`);
    store.dispatch(setProfilePhoto(profilePhoto || schoolPicture));
  }

  render() {
    const { loaded } = this.state;
    let Navigator;
    if (loaded) {
      const Drawer = createDrawerNavigator(
        {
          Dashboard: { screen: Dashboard },
          Schedule: { screen: Schedule },
          Settings: { screen: Settings },
        },
        {
          initialRouteName: 'Dashboard',
          contentComponent: DrawerContent,
          contentOptions: {
            activeTintColor: 'red',
            inactiveTintColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      );

      Navigator = createSwitchNavigator(
        {
          Login: { screen: Login },
          Drawer: { screen: Drawer },
        },
        { initialRouteName: hasLoggedIn() ? 'Drawer' : 'Login' },
      );
    }

    return (
      <Provider store={store}>
        <PersistGate
          loading={null}
          persistor={persistor}
          onBeforeLift={this.handleRehydrate}
        >
          <View style={styles.container}>
            <StatusBar barStyle={`${Platform.OS === 'android' ? 'light' : 'dark'}-content`} />
            {
              loaded &&
                <Navigator onNavigationStateChange={null} />
            }
          </View>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

EStyleSheet.build({
  $fontThin: 'Roboto-Thin',
  $fontLight: 'Roboto-Light',
  $fontRegular: 'Roboto-Regular',
  $fontBold: 'Roboto-Bold',
});
