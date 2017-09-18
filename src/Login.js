import React, { Component } from 'react';
import {
  Alert,
  Animated,
  AsyncStorage,
  Image,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import cheerio from 'react-native-cheerio';

import WHS from '../assets/images/WHS.png';
import LoadingGIF from '../assets/images/loading.gif';

class Login extends Component {
  state = {
    username: '',
    password: '',
    top: new Animated.Value(100),
    opacity: new Animated.Value(0),
    error: '',
    loading: false
  }

  handleInput = (credential, value) => {
    this.setState({
      [credential]: value
    });
  }

  handleLogin = async () => {
    const {
      username,
      password
    } = this.state;
    const { dispatch } = this.props.navigation;

    this.setState({
      loading: true
    });

    const userPage = await fetch(
      `https://westside-web.azurewebsites.net/account/login?Username=${username}&Password=${password}`,
      {
        method: 'POST'
      }
    );
    const userPageHTML = await userPage.text();
    const $ = cheerio.load(userPageHTML);

    const error = $('.alert.alert-danger').text().trim();
    if(error) {
      this.setState({
        error,
        loading: false
      });
    } else {
      const studentOverview = $('.card-header + .card-block');
      const studentMentorAttrs = [
        'name',
        'phone',
        'email'
      ];
      const children = studentOverview.children('p.card-subtitle:not(.text-muted)');
      const rawJSON = $('.page-content + script')[0].children[0].data.trim();

      const mentors = [...Array(3).keys()].map(key =>
        children.eq(key).text().trim()
      );

      try {
        const values = [
          username,
          password,
          $('title').text().split('|')[0].trim(),
          $('.header-title > h6').text(),
          ...mentors,
          studentOverview.children().eq(13).text().slice(15),
          rawJSON.slice(24, -2)
        ];

        [
          'username',
          'password',
          'name',
          'classOf',
          'homeroom',
          'counselor',
          'dean',
          'id',
          'schedule'
        ].forEach(async (key, index) =>
          await AsyncStorage.setItem(key, values[index])
        );
      } catch(error) {
        Alert.alert('Error', 'Something went wrong with saving your login information.');
      }

      dispatch({
        type: 'Navigation/NAVIGATE',
        routeName: 'Drawer',
        action: {
          type: 'Navigation/NAVIGATE',
          routeName: 'Dashboard',
          params: {

          }
        }
      });
    }
  }

  componentDidMount() {
    Animated.parallel([
      Animated.timing(
        this.state.top,
        {
          toValue: 0,
          duration: 1000
        }
      ),
      Animated.timing(
        this.state.opacity,
        {
          toValue: 1,
          duration: 1000
        }
      )
    ]).start();
  }

  render() {
    const {
      username,
      password,
      top,
      opacity,
      error,
      loading
    } = this.state;

    const validLogin = /^[A-Z]+\d{3}$/ig.test(username) && /^[A-Z]{3}\d{2}[A-Z]{3}$/ig.test(password);

    return (
      <Animated.View style={{
        ...styles._loginContainer,
        opacity
      }}>
        <Animated.View style={{ height: top }} />
        <Image
          source={WHS}
          style={styles._loginLogo}
        />
        <Text style={styles._loginText}>Login to WHS</Text>
        <Text style={styles._loginError}>{error}</Text>
        {
          [
            'Username',
            'Password'
          ].map((credential, index) =>
            <TextInput
              key={index}
              underlineColorAndroid="rgba(0, 0, 0, 0)"
              onChangeText={value => this.handleInput(credential.toLowerCase(), value)}
              value={this.state[credential.toLowerCase()]}
              autoCorrect={false}
              placeholder={`  ${credential}`}
              secureTextEntry={credential === 'Password'}
              style={styles._loginInput}
            />
          )
        }
        <TouchableOpacity
          onPress={this.handleLogin}
          disabled={!validLogin}
          style={{
            ...styles._loginButton,
            backgroundColor: loading ? 'lightgray' : validLogin ? 'rgba(220, 20, 60, 1)' : 'white'
          }}
        >
          {
            loading ?
              <Image
                source={LoadingGIF}
                style={styles._loginLoadingGIF}
              />
            :
              <Text style={{
                ...styles._loginButtonText,
                color: validLogin ? 'white' : 'gray',
              }}>Login</Text>
          }
        </TouchableOpacity>
      </Animated.View>
    );
  }
}

const styles = EStyleSheet.create({
  $loginWidth: 236.5,
  $loginMargin: 15,
  $loginImageSize: 125,
  $loginLoadingGIFSize: 20,
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  loginLogo: {
    width: '$loginImageSize * 1.2',
    height: '$loginImageSize',
    margin: '$loginMargin * 0.6'
  },
  loginText: {
    textAlign: 'center',
    fontFamily: 'Roboto-Thin',
    fontSize: 40,
    width: '$loginWidth',
    margin: '$loginMargin',
    marginBottom: '$loginMargin * 0.6',
    backgroundColor: 'rgba(0, 0, 0, 0)'
  },
  loginError: {
    fontFamily: 'Roboto-Thin',
    fontSize: 12,
    color: 'red',
    backgroundColor: 'white'
  },
  loginInput: {
    margin: '$loginMargin * 0.8',
    width: '$loginWidth',
    height: 47,
    fontSize: 18,
    borderBottomColor: 'gray',
    borderBottomWidth: 0.9
  },
  loginButton: {
    margin: '$loginMargin * 2',
    width: '$loginWidth',
    height: 45,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginButtonText: {
    fontFamily: 'Roboto-Light',
    fontSize: 17
  },
  loginLoadingGIF: {
    width: '$loginLoadingGIFSize',
    height: '$loginLoadingGIFSize'
  }
});

export default Login;
