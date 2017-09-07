import React, { Component } from 'react';
import {
  AsyncStorage,
  ScrollView,
  Text,
  StyleSheet,
  View
} from 'react-native';
import { StackNavigator } from 'react-navigation';
import { Font } from 'expo';

import EStyleSheet from 'react-native-extended-stylesheet';

import RobotoLight from './assets/fonts/Roboto-Light.ttf';
import RobotoThin from './assets/fonts/Roboto-Thin.ttf';
import BebasNeueBook from './assets/fonts/BebasNeue-Book.ttf';

import Login from './src/Login.js';
import Dashboard from './src/Dashboard.js';

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
const Navigator = StackNavigator({
  Login: {
    screen: Login
  },
  Dashboard: {
    screen: Dashboard
  }
}, {
  initialRouteName: hasLoggedIn() ? 'Dashboard' : 'Login',
  navigationOptions: {
    header: null
  }
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
