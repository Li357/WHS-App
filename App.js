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
    loading: true
  }

  hasLoggedIn = () => {
    const {
      username,
      password,
      error
    } = store.getState();
    return `${username}${password}`.length > 2 && !error;
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
      const { dates } = store.getState();
      if(dates.length === 0) { //Fetch dates on app first load
        await store.dispatch(fetchDates());
      }

      if(this.hasLoggedIn()) {
        const {
          username,
          password,
          id,
          refreshedOne,
          refreshedTwo
        } = store.getState();

        try {
          const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
          store.dispatch(setProfilePhoto(profilePhoto ?
            profilePhoto : `https://westsidestorage.blob.core.windows.net/student-pictures/${id}.jpg`
          ));

          const now = new Date();
          const refreshTimes = dates.filter(date => date.first || date.second);
          const [semesterTwo, semesterOne] = refreshTimes.map(({
            year,
            month,
            day
          }) => new Date(year, month - 1, day));
          const {
            year,
            month,
            day
          } = dates.filter(date => date.last)[0];

          if(now >= semesterOne && now <= semesterTwo && !refreshedOne) { //if between sem 1 and sem 2 and not refreshed
            await store.dispatch(setRefreshed('one', true));
            await store.dispatch(fetchUserInfo(username, password, true));
          } else if(now >= semesterTwo && now <= new Date(year, month - 1, day) && !refreshedTwo) { //if between sem 2 and last day of school and not refreshed
            await store.dispatch(setRefreshed('two', true));
            await store.dispatch(fetchUserInfo(username, password, true));
          } else if(
            +new Date(year, month - 1, day) <= +new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()) //if after last day
          ) {
            await store.dispatch(setRefreshed('one', false));
            await store.dispatch(setRefreshed('two', false));
            await store.dispatch(setLastSummer(+new Date(year, month - 1, day)));
            await store.dispatch(fetchDates(true)); //fetch dates after last day
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

      this.setState({
        loading: false
      });
    });
  }

  render() {
    if(!this.state.loading) {
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
  }
});

EStyleSheet.build();

export default codePush(App);
