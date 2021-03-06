import React, { Component, StrictMode } from 'react';
import { AppState, View, StyleSheet, StatusBar, Platform } from 'react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { createSwitchNavigator, createDrawerNavigator } from 'react-navigation';
import codePush from 'react-native-code-push';
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
  setProfilePhoto,
  setDayInfo,
  logOut,
} from './src/actions/actionCreators';
import { getDayInfo } from './src/util/querySchedule';
import { reportError, bugsnag, triggerScheduleCaution } from './src/util/misc';

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
      const { dayInfo: { lastUpdate } } = store.getState();
      const now = moment();
      const today = now.day();
      if (
        newStatus === 'active'
        && lastUpdate && !lastUpdate.isSame(now, 'day') // Only update if not updated in one day
        && today !== 0 && today < 6 // Ignores global locale, 0 is Sun, 6 is Sat
      ) {
        this.updateDayInfo(now); // Pass already created instance
      }
    }
  }

  handleRehydrate = async () => {
    const { dayInfo, schedule, specialDates } = store.getState();

    /* LEGACY BUG/UPDATE LOGOUT HANDLERS */
    // Checks for typeof undefined because v1.x users will not have dayInfo in store
    if (typeof dayInfo === 'undefined') {
      bugsnag.leaveBreadcrumb('Logging v1.x user out');
      // Log out and reset store on update to v2 if the user is previous v1.x user
      store.dispatch(logOut());
    }

    // Handle case where teacher's schedules have at least one day completely class-less, causing dashboard bug
    if (schedule.length !== 5) {
      bugsnag.leaveBreadcrumb('Logging invalid teacher out');
      store.dispatch(logOut());
    }

    // Handle typo that open mods and first open mods have no day properties
    const lacksDate = schedule.some(([firstClass]) => !firstClass.day);
    if (lacksDate) {
      bugsnag.leaveBreadcrumb('Logging invalid schedule out');
      store.dispatch(logOut());
    }

    if (specialDates) {
      // assemblyDates, earlyDismissalDates, lateStartDates, noSchoolDates
      // semesterOneStart, semesterOneEnd, semesterTwoStart, lastDay
      // Fixes bug in <2.0-b12 with v2 express server
      if (Object.keys(specialDates).length < 8) {
        this.setState({
          rehydrateStatus: 'Updating dates...',
        });
        bugsnag.leaveBreadcrumb('Fixing invalid specialDates');
        await store.dispatch(fetchSpecialDates());
      }
    }
    /* END LEGACY BUG/UPDATE LOGOUT HANDLERS */
    // This runs some preload manual rehydrating and calculating after auto rehydrate
    if (hasLoggedIn()) {
      if (typeof schedule === 'string') {
        bugsnag.leaveBreadcrumb('Logging invalid user out');
        store.dispatch(logOut());
      }

      try {
        bugsnag.leaveBreadcrumb('Refreshing day info - manual');
        const { dayInfo: { lastUpdate, isSummer } } = store.getState();
        const now = moment();
        const today = now.day();
        if (
          lastUpdate && !lastUpdate.isSame(now, 'day') // Only update if not updated in one day
          && today !== 0 && today < 6 // Ignores global locale, 0 is Sun, 6 is Sat)
        ) {
          this.setState({
            rehydrationStatus: 'Updating today\'s information...',
          });

          bugsnag.leaveBreadcrumb('Silently fetching other dates');
          await this.silentlyFetchData();

          bugsnag.leaveBreadcrumb('Updating today\'s info');
          this.updateDayInfo(now);
        }

        const {
          specialDates: { semesterOneStart, semesterTwoStart, lastDay },
          refreshedSemesterOne,
          refreshedSemesterTwo,
          username,
          password,
        } = store.getState();

        if (isSummer) {
          triggerScheduleCaution(semesterOneStart);
        } else {
          this.setState({
            rehydrationStatus: 'Auto-refreshing your information...',
          });

          if (
            now.isSameOrAfter(semesterTwoStart, 'day') && now.isSameOrBefore(lastDay, 'day')
            && !refreshedSemesterTwo
          ) {
            bugsnag.leaveBreadcrumb('Refreshing semester two');
            // If in semester two and has not refreshed, refresh info
            await store.dispatch(fetchUserInfo(username, password));
          } else if (
            now.isSameOrAfter(semesterOneStart, 'day') && now.isSameOrBefore(semesterTwoStart, 'day')
            && !refreshedSemesterOne
          ) {
            bugsnag.leaveBreadcrumb('Refreshing semester one');
            // If in semester one and has not refreshed, refresh info
            await store.dispatch(fetchUserInfo(username, password));
          }
        }

        bugsnag.leaveBreadcrumb('Updating profile photo');
        this.setState({
          rehydrationStatus: 'Getting your profile picture...',
        });
        // Since next line is async, must wait for it or else state will be set before it finishes
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

  updateDayInfo = (date = moment()) => {
    const { specialDates } = store.getState();
    store.dispatch(setDayInfo(...getDayInfo(specialDates, date)));
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

  silentlyFetchData = async () => {
    // We want to update dates every single app open, no need to report error if no internet
    try {
      const { username, password, schoolPicture } = store.getState();

      await store.dispatch(fetchSpecialDates());
      if (schoolPicture.includes('blank-user')) {
        await store.dispatch(fetchUserInfo(username, password, false, true));
      }
    /* eslint-disable no-empty */
    } catch (error) {}
    /* eslint-enable no-empty */
  }

  codePushStatusDidChange(status) {
    switch (status) {
      case codePush.SyncStatus.CHECKING_FOR_UPDATE:
      case codePush.SyncStatus.DOWNLOADING_PACKAGE:
      case codePush.SyncStatus.SYNC_IN_PROGRESS:
        this.setState({
          codePushFinished: false,
          codePushStatus: this.codePushStatuses[status],
        });
        return;
      case codePush.SyncStatus.UPDATE_INSTALLED:
        return;
      default:
        // This will only happen if there is an unknown error or code-push is finished
        this.setState({
          codePushFinished: true,
        });
    }
  }

  codePushDownloadDidProgress({ receivedBytes, totalBytes }) {
    this.setState({
      codePushProgress: receivedBytes / totalBytes,
    });
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
