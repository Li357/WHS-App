import React, { Component, StrictMode } from 'react';
import { AppState, View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import {
  createAppContainer,
  createSwitchNavigator,
  createDrawerNavigator,
} from '@react-navigation/native';
import codePush, { SyncStatus } from 'react-native-code-push';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';
import momentDurationFormat from 'moment-duration-format';

import { store, persistor, storage } from './src/util/initializeStore';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Settings from './src/screens/Settings';
import Loading from './src/screens/Loading';
import DrawerContent from './src/components/DrawerContent';
import {
  fetchSpecialDates,
  fetchUserInfo,
  fetchSchoolPicture,
  setProfilePhoto,
  setDayInfo,
  setRefreshed,
} from './src/actions/actionCreators';
import { getDayInfo } from './src/util/querySchedule';
import { reportError, bugsnag, triggerScheduleCaution } from './src/util/misc';
import legacyHandlers from './src/util/legacyHandlers';

// Update locale before using it in transform
moment.updateLocale('en', {
  week: { dow: 1 },
});
momentDurationFormat(moment);

const hasLoggedIn = () => {
  const { username, password } = store.getState();
  return username && password;
};

const codePushOptions = {
  installMode: codePush.InstallMode.ON_NEXT_RESUME,
};

@codePush(codePushOptions)
export default class App extends Component {
  state = {
    rehydrated: false,
    rehydrateStatus: '',
    codePushFinished: false,
    codePushStatus: 'Checking for updates...',
    codePushProgress: 0,
  }
  /* eslint-disable react/sort-comp */
  codePushStatuses = {
    4: 'Syncing in progress...',
    5: 'Checking for updates...',
    7: 'Downloading update...',
  }
  /* eslint-enable react/sort-comp */

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  handleAppStateChange = async (newStatus) => {
    if (this.state.rehydrated && hasLoggedIn()) { // Checks if logged in and rehydrated just in case
      /**
       * This handler handles the case where the user does not quit the app but has it in the
       * background, in which case the app does some updates when they refocus the app
       */
      const isActive = newStatus === 'active';
      if (isActive) {
        this.updateDayInfoIfNeeded(); // Pass already created instance
      }
    }
  }

  handleRehydrate = async () => {
    // Legacy handlers to handle legacy issues when state rehydrates, such as defective schedules
    legacyHandlers.forEach(handler => handler(store));

    // This runs some preload manual rehydrating and calculating after auto rehydrate
    if (hasLoggedIn()) {
      try {
        bugsnag.leaveBreadcrumb('Refreshing day info - manual');
        this.setStatus('Updating today\'s information...');
        this.updateDayInfoIfNeeded(now);

        bugsnag.leaveBreadcrumb('Silently fetching special dates');
        this.silentlyFetchDatesAndPicture();

        bugsnag.leaveBreadcrumb('Refreshing information');
        this.setStatus('Auto-refreshing your information...');
        this.refreshUserInfoIfNeeded(now);

        bugsnag.leaveBreadcrumb('Updating profile photo');
        this.setStatus('Getting your profile picture...');
        await this.updateProfilePhoto();
      } catch (error) {
        reportError(
          'Something went wrong reloading your information. Please try restarting the app.',
          error,
        );
        return;
      }
    }
    this.setState({ rehydrated: true });
  }

  updateDayInfoIfNeeded = (now = moment()) => {
    const { dayInfo: { lastUpdate }, specialDates } = store.getState();
    const today = now.day();

    const hasUpdatedToday = lastUpdate && lastUpdated.isSame(now, 'day');
    const isSchoolDay = today !== 0 && today < 6;

    if (!hasUpdatedToday && isSchoolDay) {
      store.dispatch(setDayInfo(...getDayInfo(specialDates, date)));
    }
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

  silentlyFetchDatesAndPicture = async () => {
    // We want to update dates every single app open, no need to report error if no internet
    try {
      const { username, password, schoolPicture } = store.getState();

      await store.dispatch(fetchSpecialDates());
      if (schoolPicture.includes('blank-user')) {
        await store.dispatch(fetchSchoolPicture(username, password));
      }
    /* eslint-disable no-empty */
    } catch (error) {}
    /* eslint-enable no-empty */
  }

  refreshUserInfoIfNeeded = async (now = moment()) => {
    const {
      specialDates: {
        semesterOneStart,
        semesterOneEnd,
        semesterTwoStart,
        lastDay,
      },
      refreshedSemesterOne,
      refreshedSemesterTwo,
      username,
      password,
    } = store.getState();
    const isSemesterTwo = now.isSameOrAfter(semesterTwoStart, 'day') && now.isSameOrBefore(lastDay, 'day');
    const isSemesterOne = now.isSameOrAfter(semesterOneStart, 'day') && now.isSameOrBefore(semesterOneEnd, 'day');

    if (!isSemesterOne && !isSemesterTwo) {
      return;
    }

    if (!refreshedSemesterTwo && isSemesterTwo) {
      bugsnag.leaveBreadcrumb('Refreshing semester two');
      store.dispatch(setRefreshed(true, true));
    } else if (!refreshedSemesterOne && isSemesterOne) {
      bugsnag.leaveBreadcrumb('Refreshing semester one');
      store.dispatch(setRefreshed(true, false));
    }

    await store.dispatch(fetchUserInfo(username, password));
  }

  setStatus = status => this.setState({ rehydrateStatus: status });

  codePushStatusDidChange(status) {
    switch (status) {
      case SyncStatus.CHECKING_FOR_UPDATE:
      case SyncStatus.DOWNLOADING_PACKAGE:
      case SyncStatus.SYNC_IN_PROGRESS:
        this.setState({ codePushStatus: this.codePushStatuses[status] });
        break;
      case SyncStatus.UP_TO_DATE:
      case SyncStatus.UNKNOWN_ERROR:
        this.setState({ codePushFinished: true });
      default:
    }
  }

  codePushDownloadDidProgress({ receivedBytes, totalBytes }) {
    this.setState({ codePushProgress: receivedBytes / totalBytes });
  }

  renderApp = () => {
    const { rehydrated, codePushFinished } = this.state;

    if (rehydrated && codePushFinished) {
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
      const Navigator = createSwitchNavigator(
        {
          Login: { screen: Login },
          Drawer: { screen: Drawer },
        },
        { initialRouteName: hasLoggedIn() ? 'Drawer' : 'Login' },
      );
      const AppContainer = createAppContainer(Navigator);

      return (<AppContainer onNavigationStateChange={null} />);
    }

    return (<Loading {...this.state} />);
  }

  render() {
    return (
      <StrictMode>
        <Provider store={store}>
          <PersistGate
            loading={<Loading {...this.state} />}
            persistor={persistor}
            onBeforeLift={this.handleRehydrate}
          >
            <View style={styles.container}>
              <StatusBar barStyle={`${Platform.OS === 'android' ? 'light' : 'dark'}-content`} />
              {this.renderApp()}
            </View>
          </PersistGate>
        </Provider>
      </StrictMode>
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
