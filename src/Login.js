import React, { Component } from 'react';
import {
  Alert,
  Animated,
  AsyncStorage,
  Image,
  Keyboard,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { connect } from 'react-redux';

import cheerio from 'react-native-cheerio';
import EStyleSheet from 'react-native-extended-stylesheet';

import { fetchUserInfo } from './actions/actionCreators.js';
import WHS from '../assets/images/WHS.png';
import LoadingGIF from '../assets/images/loading.gif';

class Login extends Component {
  state = {
    username: '',
    password: '',
    top: new Animated.Value(100),
    opacity: new Animated.Value(0),
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

    const {
      dispatch,
      navigation
    } = this.props;

    this.setState({
      loading: true
    });

    await dispatch(fetchUserInfo(username, password));

    this.setState({
      loading: false
    });

    if(!this.props.error) {
      Keyboard.dismiss();

      navigation.dispatch({
        type: 'Navigation/NAVIGATE',
        routeName: 'Drawer',
        action: {
          type: 'Navigation/NAVIGATE',
          routeName: 'Dashboard'
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
      loading
    } = this.state;

    const { error } = this.props;

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
          disabled={!validLogin && !loading}
          style={{
            ...styles._loginButton,
            backgroundColor: loading ? 'lightgray' : validLogin ? 'rgba(220, 20, 60, 1)' : 'lightgray'
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

const mapStateToProps = ({
  error,
  username
}) => ({
  error,
  username
});

export default connect(
  mapStateToProps
)(Login);
