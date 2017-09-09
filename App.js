import React, { Component } from 'react';
import {
  AsyncStorage,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import {
  DrawerNavigator,
  DrawerItems,
  StackNavigator
} from 'react-navigation';
import { Font } from 'expo';

import EStyleSheet from 'react-native-extended-stylesheet';

import RobotoLight from './assets/fonts/Roboto-Light.ttf';
import RobotoThin from './assets/fonts/Roboto-Thin.ttf';
import BebasNeueBook from './assets/fonts/BebasNeue-Book.ttf';

import Login from './src/Login.js';
import Dashboard from './src/Dashboard.js';
import Schedule from './src/Schedule.js';
import HamburgerMenu from './src/HamburgerMenu.js';

const hasLoggedIn = async () => {
  try {
    const username = await AsyncStorage.getItem('username');
    const password = await AsyncStorage.getItem('password');

    return username && password;
  } catch(error) {
    Alert.alert('Something went wrong with getting your login information.');
    return false;
  }
}
const Drawer = DrawerNavigator({
  Dashboard: {
    screen: Dashboard
  },
  /*Schedule: {
    screen: Schedule
  }*/
}, {
  initialRouteName: 'Dashboard'
});
const Navigator = StackNavigator({
  Login: {
    screen: Login
  },
  Drawer: {
    screen: Drawer
  }
}, {
  initialRouteName: hasLoggedIn() ? 'Drawer' : 'Login',
  navigationOptions: ({ navigation }) => ({
    header: <HamburgerMenu navigation={navigation} />
  })
});

class App extends Component {
  state = {
    fontsLoaded: false
  }

  async componentDidMount() {
    await Font.loadAsync({
      RobotoLight,
      RobotoThin,
      BebasNeueBook
    });
    this.setState({
      fontsLoaded: true
    });
  }

  render() {
    const { fontsLoaded } = this.state;

    return (
      <View style={styles.appContainer}>
        <StatusBar
          barStyle="dark-content"
        />
        {
          fontsLoaded &&
            <Navigator />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1
  }
});

EStyleSheet.build();

export default App;
