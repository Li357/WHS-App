import React, { Component } from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  Image,
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

import EStyleSheet from 'react-native-extended-stylesheet';

import Login from './src/Login.js';
import Dashboard from './src/Dashboard.js';
import Schedule from './src/Schedule.js';
import HamburgerMenu from './src/HamburgerMenu.js';

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
    navigator: null
  }

  hasLoggedIn = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');

      return username && password;
    } catch(error) {
      Alert.alert('Error', 'Something went wrong with getting your login information.');
      return false;
    }
  }

  handleLogout = async navigate => {
    try {
      AsyncStorage.multiRemove([
        'username',
        'password',
        'name',
        'classOf',
        'homeroom',
        'counselor',
        'dean',
        'id',
        'schedule',
        'profilePhoto'
      ], (error) => {
        if(error) {
          throw error;
        }
        navigate('Login');
      });
    } catch(error) {
      Alert.alert('Error', 'Something went wrong logging out.');
    }
  }

  Drawer = DrawerNavigator({
    Dashboard: {
      screen: Dashboard
    },
    Schedule: {
      screen: Schedule
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
    },
    gesturesEnabled: false
  });

  async componentDidMount() {
    this.setState({
      navigator: StackNavigator({
        Login: {
          screen: Login
        },
        Drawer: {
          screen: this.Drawer
        }
      }, {
        initialRouteName: await this.hasLoggedIn() ? 'Drawer' : 'Login',
        navigationOptions: {
          header: null
        }
      })
    });
  }

  render() {
    return (
      <View style={styles.appContainer}>
        <StatusBar
          barStyle="dark-content"
        />
        {
          this.state.navigator &&
            <this.state.navigator onNavigationStateChange={null} />
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1
  },
  wrapper: {
    marginTop: 20
  },
  wrapperLogoutButton: {
    marginTop: Dimensions.get('window').height - 250,
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

export default App;
