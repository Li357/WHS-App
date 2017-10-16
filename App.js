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
  setProfilePhoto,
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
      if(this.hasLoggedIn()) {
        const {
          username,
          id
        } = store.getState();

        try {
          const profilePhoto = await AsyncStorage.getItem(`${username}:profilePhoto`);
          store.dispatch(setProfilePhoto(profilePhoto ?
            profilePhoto : `https://westsidestorage.blob.core.windows.net/student-pictures/${id}.jpg`
          ));
        } catch(error) {
          Alert.alert('Error', `An error occurred: ${error}`);
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
