import React, { Component } from 'react';
import { View, StyleSheet, StatusBar, Platform } from 'react-native';
import { applyMiddleware, createStore } from 'redux';
import { Provider } from 'react-redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { PersistGate } from 'redux-persist/integration/react';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStackNavigator, createDrawerNavigator } from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';

import WHSApp from './src/reducers/reducer';
import Login from './src/screens/Login';
import Dashboard from './src/screens/Dashboard';
import Schedule from './src/screens/Schedule';
import Settings from './src/screens/Settings';

const persistConfig = {
  key: 'root',
  storage,
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

const hasLoggedIn = () => {
  const { username, password } = store.getState();
  return username && password;
};

export default class App extends Component {
  render() {
    const Drawer = createDrawerNavigator({
      Dashboard: { screen: Dashboard },
      Schedule: { screen: Schedule },
      Settings: { screen: Settings },
    }, {
      initialRouteName: 'Dashboard',
      contentOptions: {
        activeTintColor: 'black',
        inactiveTintColor: 'rgba(0, 0, 0, 0.5)',
      },
    });

    const Navigator = createStackNavigator({
      Login: { screen: Login },
      Drawer: { screen: Drawer },
    }, {
      initialRouteName: hasLoggedIn() ? 'Drawer' : 'Login',
      navigationOptions: {
        header: null,
        gesturesEnabled: false,
      },
    });

    return (
      <Provider store={store}>
        <PersistGate loading={/* TODO */ null} persistor={persistor}>
          <View style={styles.container}>
            <StatusBar barStyle={`${Platform.OS === 'android' ? 'light' : 'dark'}-content`} />
            <Navigator onNavigationStateChange={null} style={{width: 305}} />
          </View>
        </PersistGate>
      </Provider>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
});

EStyleSheet.build();
