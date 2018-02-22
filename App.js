import React, { Component } from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
  View,
} from 'react-native';
import {
  DrawerItems,
  DrawerNavigator,
  StackNavigator
} from 'react-navigation';

import { Provider } from 'react-redux';
import {
  applyMiddleware,
  createStore,
  compose
} from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import {
  persistStore,
  autoRehydrate
} from 'redux-persist';
import {
  fetchDates,
  receiveDates,
  fetchUserInfo,
  setProfilePhoto,
  setRefreshed,
  setLastSummer,
  logOut
} from './src/actions/actionCreators';
import whsApp from './src/reducers/reducer.js';

import EStyleSheet from 'react-native-extended-stylesheet';

import codePush from 'react-native-code-push';

import Login from './src/Login.js';
import Dashboard from './src/Dashboard.js';
import Schedule from './src/Schedule.js';
import Settings from './src/Settings.js';
import LoadingGIF from './assets/images/loading.gif';

const store = createStore(
  whsApp,
  compose(
    autoRehydrate(),
    applyMiddleware(
      thunk,
      createLogger()
    )
  )
);

const DrawerWrapper = ({ onLogout, ...props }) => (
  <View style={styles.wrapper}>
    <DrawerItems {...props} />
    <TouchableOpacity
      onPress={onLogout}
      style={styles.wrapperLogoutButton}
    >
      <Text style={styles.wrapperLogoutText}>Logout</Text>
    </TouchableOpacity>
  </View>
);

class App extends Component {
  state = {
    loading: true,
    loadStatus: '',
    downloadStatus: 'Checking for updates...',
    downloadProgress: '0%'
  }

  codePushStatusDidChange(status) {
    /* See codePush.SyncStatus
       0: up to date
       1: update installed
       2: update ignored
       3: unknown error
       4: sync in progress
       5: checking for updates
       6: awaiting user action
       7: downloading package
       8: installing update
    */

    if(this.state.loading) {
      this.setState({
        downloadStatus: [
          'Up to date',
          'Update installed',
          'Update ignored',
          'Error',
          'Syncing...',
          'Checking for updates...',
          'Awaiting user action...',
          'Downloading updates: ',
          'Installing update...'
        ][status]
      });
    }
  }

  codePushDownloadDidProgress({ receivedBytes, totalBytes }) {
    if(this.state.loading) {
      this.setState({
        downloadProgress: `${(receivedBytes / totalBytes * 100).toFixed(0)}%`
      });
    }
  }

  hasLoggedIn = () => {
    const {
      username,
      password,
      error
    } = store.getState();
    return `${username}${password}`.length > 2 && !error.trim();
  }

  handleLogout = navigate => {
    store.dispatch(logOut());
    navigate('Login');
  }

  componentWillMount() {
    this.persistor = persistStore(store, {
      storage: AsyncStorage,
      blacklist: ['profilePhoto']
    }, async () => {
      {
        const { dates } = store.getState();

        //SET_SCHEDULE is an action for testing

        //late check is to check if app has late dates
        if(dates.length === 0 ||
          (dates.length > 0 &&
            (
              dates.every(({ late }) => !late) ||
              dates.every(({ finals }) => !finals) ||
              dates.every(({ early }) => !early)
            )
          )
        ) { //Fetch dates on app first load
          this.setState({
            status: 'Fetching school calendar...'
          });
          try {
            await store.dispatch(fetchDates());
          } catch(error) {
            Alert.alert(
              'Error',
              `An error occurred: ${error}`,
              [
                { text: 'OK' }
              ]
            );
          }
        }

        if(!dates.find(({
          day,
          month,
          year
        }) => day === 2 && month === 2 && year === 2018)) {
          store.dispatch(receiveDates([
            ...store.getState().dates,
            {
              month: 2,
              day: 2,
              year: 2018,
              first: false,
              second: false,
              last: false,
              late: false,
              assembly: true,
              early: false
            }
          ]));
        }
      }

      if(this.hasLoggedIn()) {
        const {
          username,
          password,
          id,
          schoolPicture,
          profilePhoto,
          refreshedOne,
          refreshedTwo,
          dates
        } = store.getState();

        try {
          const pictureId = schoolPicture && schoolPicture.slice(63);
          if(!schoolPicture || pictureId.length === 5 && pictureId === id) {
            this.setState({
              status: 'Getting school picture...'
            });
            await store.dispatch(fetchUserInfo(username, password));
          }

          this.setState({
            status: 'Getting profile photo...'
          });
          const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
          await store.dispatch(setProfilePhoto(profilePhoto ? profilePhoto : schoolPicture));

          this.setState({
            status: 'Calculating the semester...'
          });
          const now = new Date();
          const refreshTimes = dates.filter(({ first, second }) => first || second);
          const [semesterTwo, semesterOne] = refreshTimes.map(({
            year,
            month,
            day
          }) => new Date(year, month - 1, day));
          const {
            year,
            month,
            day
          } = dates.filter(date => date.last)[0] || {};

          if(year) {
            if(now >= semesterOne && now <= semesterTwo && !refreshedOne) { //if between sem 1 and sem 2 and not refreshed
              await store.dispatch(setRefreshed('one', true));
              await store.dispatch(fetchUserInfo(username, password, true, profilePhoto && profilePhoto.startsWith('https://')));
            } else if(now >= semesterTwo && now <= new Date(year, month - 1, day) && !refreshedTwo) { //if between sem 2 and last day of school and not refreshed
              await store.dispatch(setRefreshed('two', true));
              await store.dispatch(fetchUserInfo(username, password, true, profilePhoto && profilePhoto.startsWith('https://')));
            } else if(
              +new Date(year, month - 1, day) <= +new Date(now.getFullYear(), now.getMonth(), now.getDate()) //if after last day
            ) {
              await store.dispatch(setRefreshed('one', false));
              await store.dispatch(setRefreshed('two', false));
              await store.dispatch(setLastSummer(+new Date(year, month - 1, day)));
              await store.dispatch(fetchDates(true)); //fetch dates after last day
            }
          }
        } catch(error) {
          Alert.alert(
            'Error',
            `An error occurred: ${error}`,
            [
              { text: 'OK' }
            ]
          );
        }
      }

      //try {

      /*} catch(error) {
        Alert.alert(
          'Error',
          `An error occurred: ${error}`,
          [
            { text: 'OK' }
          ]
        );
      }*/

      this.setState({
        loading: false
      });
    });
  }

  render() {
    const {
      downloadProgress,
      downloadStatus,
      loading,
      status
    } = this.state;

    if(!loading) {
      const Drawer = DrawerNavigator({
        Dashboard: {
          screen: Dashboard
        },
        Schedule: {
          screen: Schedule
        },
        Settings: {
          screen: Settings
        }
      }, {
        initialRouteName: 'Dashboard',
        contentComponent: props => <DrawerWrapper
          onLogout={() => this.handleLogout(props.navigation.navigate)}
          {...props}
        />,
        contentOptions: {
          activeTintColor: 'black',
          inactiveTintColor: 'rgba(0, 0, 0, 0.5)'
        }
      });

      const Navigator = StackNavigator({
        Login: {
          screen: Login
        },
        Drawer: {
          screen: Drawer
        }
      }, {
        initialRouteName: this.hasLoggedIn() ? 'Drawer' : 'Login',
        navigationOptions: {
          header: null,
          gesturesEnabled: false
        }
      });

      return (
        <Provider store={store}>
          <View style={styles.appContainer}>
            <StatusBar barStyle={`${Platform.OS === 'android' ? 'light' : 'dark'}-content`} />
            <Navigator onNavigationStateChange={null} />
          </View>
        </Provider>
      );
    }

    return (
      <View style={styles._loadingAppContainer}>
        <Image
          style={styles._loadingGIF}
          source={LoadingGIF}
        />
        <Text style={styles._codePushIndicator}>
          {downloadStatus}
          {
            downloadStatus === 'Downloading updates: ' &&
              downloadProgress
          }
          {'\n'}
          {status}
        </Text>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  appContainer: {
    flex: 1
  },
  loadingAppContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingGIF: {
    width: 40,
    height: 40
  },
  wrapper: {
    marginTop: 20
  },
  wrapperLogoutButton: {
    marginTop: '100% - 275px',
    padding: 10,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  },
  wrapperLogoutText: {
    fontFamily: 'Roboto-Light',
    fontSize: 17,
    textAlign: 'center'
  },
  codePushIndicator: {
    margin: 10,
    textAlign: 'center'
  }
});

EStyleSheet.build();

export default codePush(App);
