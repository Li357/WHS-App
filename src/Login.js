import React, { Component } from 'react';
import {
  Alert,
  Animated,
  AsyncStorage,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import { connect } from 'react-redux';

import cheerio from 'react-native-cheerio';
import EStyleSheet from 'react-native-extended-stylesheet';

import {
  fetchUserInfo,
  setRefreshed,
  setLastSummer,
  fetchDates
} from './actions/actionCreators.js';
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

    await dispatch(fetchUserInfo(`${username[0].toUpperCase()}${username.slice(1)}`, password));
    await this.calculateSemester();

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

  calculateSemester = async () => {
    const {
      dates,
      refreshedOne,
      refreshedTwo,
      dispatch
    } = this.props;

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
    } = dates.filter(({ last }) => last)[0] || {};

    if(year) {
      if(now >= semesterOne && now <= semesterTwo && !refreshedOne) { //if between sem 1 and sem 2 and not refreshed
        await dispatch(setRefreshed('one', true));
      } else if(now >= semesterTwo && now <= new Date(year, month - 1, day) && !refreshedTwo) { //if between sem 2 and last day of school and not refreshed
        await dispatch(setRefreshed('two', true));
      } else if(
        +new Date(year, month - 1, day) <= +new Date(now.getFullYear(), now.getMonth(), now.getDate()) //if after last day
      ) {
        await dispatch(setRefreshed('one', false));
        await dispatch(setRefreshed('two', false));
        await dispatch(setLastSummer(+new Date(year, month - 1, day)));
        await dispatch(fetchDates(true)); //fetch dates after last day
      }
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

    const validLogin = (/^[A-Z]+\d{3}$/ig.test(username) || /^[A-Z]+\.[A-Z]+$/ig.test(username)) && password.length > 2;

    return (
      <KeyboardAvoidingView
        style={styles._loginContainer}
        {
          ...Platform.select({
            ios: {
              behavior: 'position',
              keyboardVerticalOffset: -80
            }
          })
        }
      >
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
          {
            error.trim().length > 1 &&
              <Text style={styles._loginError}>{error}</Text>
          }
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
      </KeyboardAvoidingView>
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
    margin: '$loginMargin * 0.6',
    marginTop: 40
  },
  loginText: {
    textAlign: 'center',
    fontFamily: 'Roboto-Thin',
    fontSize: 40,
    width: '$loginWidth',
    height: 53,
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
  username,
  dates,
  refreshedOne,
  refreshedTwo
}) => ({
  error,
  username,
  dates,
  refreshedOne,
  refreshedTwo
});

export default connect(
  mapStateToProps
)(Login);
