import React, { Component } from 'react';
import { Alert, View, StyleSheet, StatusBar, Platform } from 'react-native';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';

import WHSApp from './src/reducers/reducer';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Settings from './src/screens/Settings';
import DrawerContent from './src/components/DrawerContent';
import { setProfilePhoto } from './src/actions/actionCreators';

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['profilePhoto', 'loginError'],
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

const hasLoggedIn = () => {
  const { username, password } = store.getState();
  return username && password;
};

export default class App extends Component {
  state = { loaded: false }

  handleRehydrate = async () => {
    // This runs some preload manual rehydrating and calculating after auto rehydrate
    if (hasLoggedIn()) {
      try {
        /**
         * Explicit blacklist from store rehydration and manual getting
         * of profile photo gets rid of profile photo collision when
         * more than two people login on the same device
         */
        const { username, schoolPicture } = store.getState();
        const profilePhoto = await storage.getItem(`${username}:profilePhoto`);
        store.dispatch(setProfilePhoto(profilePhoto || schoolPicture));
      } catch (error) {
        Alert.alert(
          'Error', `${error}`,
          [{ text: 'OK' }],
        );
        // TODO: Alert error & better error reporting
      }
    }
    this.setState({ loaded: true });
  }

  render() {
    const { loaded } = this.state;
    let Navigator;
    if (loaded) {
      const Drawer = createDrawerNavigator({
        Dashboard: { screen: Dashboard },
        Schedule: { screen: Schedule },
        Settings: { screen: Settings },
      }, {
        initialRouteName: 'Schedule',
        contentComponent: DrawerContent,
        contentOptions: {
          activeTintColor: 'red',
          inactiveTintColor: 'rgba(0, 0, 0, 0.5)',
        },
      });

      Navigator = createStackNavigator({
        Login: { screen: Login },
        Drawer: { screen: Drawer },
      }, {
        initialRouteName: hasLoggedIn() ? 'Drawer' : 'Login',
        navigationOptions: {
          header: null,
          gesturesEnabled: false,
        },
        cardStyle: { backgroundColor: 'white' },
      });
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
