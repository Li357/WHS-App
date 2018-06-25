import React, { PureComponent } from 'react';
import { Animated, Alert, KeyboardAvoidingView, Image, Text, Easing } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Form, Input, Item, Button } from 'native-base';
import { CircleSnail } from 'react-native-progress';
import { connect } from 'react-redux';

import { fetchUserInfo } from '../actions/actionCreators';
import { WIDTH, HEIGHT } from '../constants/constants';
import logo from '../../assets/images/WHS.png';

const mapStateToProps = ({ loginError }) => ({ loginError });

@connect(mapStateToProps)
export default class Login extends PureComponent {
  state = {
    username: '',
    password: '',
    loggingIn: false,
    opacity: new Animated.Value(0),
    loginWidth: new Animated.Value(WIDTH * 0.75),
    loginAnimDone: false,
  }

  componentDidMount() {
    Animated.timing(this.state.opacity, {
      toValue: 1, duration: 1500,
    }).start();
  }

  handleInput = key => (text) => {
    this.setState({ [key]: text });
  }

  handleLogin = async () => {
    this.setState({ loggingIn: true });

    Animated.timing(this.state.loginWidth, {
      easing: Easing.sin, toValue: 50, duration: 250,
    }).start(() => {
      this.setState({ loginAnimDone: true });
    });

    try {
      const { dispatch, navigation } = this.props;
      const { username, password } = this.state;

      const success = await dispatch(fetchUserInfo(username, password));
      if (success) {
        navigation.navigate('Dashboard');
        return;
      }
    } catch (error) {
      Alert.alert(
        'Error', `${error}`,
        [{ text: 'OK' }],
      );
      // TODO: Better error reporting
    }

    // Reverse animation if login failure
    Animated.timing(this.state.loginWidth, {
      toValue: WIDTH * 0.75, duration: 250,
    }).start(() => {
      this.setState({
        loggingIn: false,
        loginAnimDone: false,
      });
    });
  }

  performLogin = async () => {

  }

  render() {
    const {
      loggingIn, opacity, loginWidth, loginAnimDone, username, password,
    } = this.state;
    const { loginError } = this.props;

    // TODO: Test keyboard offset on Android & make more dynamic
    return (
      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-HEIGHT * 0.1} style={styles.container}>
        <Animated.View style={[styles.container, { opacity }]}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.text}>Login to WHS</Text>
          <Form>
            <Item error={loginError} rounded style={styles.inputContainer}>
              <Input
                autoCorrect={false}
                autoCapitalize="none"
                onChangeText={this.handleInput('username')}
                placeholder="Username"
                style={styles.input}
              />
            </Item>
            <Item error={loginError} rounded style={styles.inputContainer}>
              <Input
                onChangeText={this.handleInput('password')}
                secureTextEntry
                placeholder="Password"
                style={styles.input}
              />
            </Item>
          </Form>
          <Animated.View
            style={[
              styles.loginContainer, {
                width: loginWidth,
                paddingHorizontal: loginAnimDone ? WIDTH / 150 : 0,
              },
            ]}
          >
            <Button
              block
              rounded
              danger
              disabled={!username || !password || loggingIn}
              onPress={this.handleLogin}
              style={styles.loginButton}
            >
              {
                loggingIn ?
                  <CircleSnail color="white" size={25} />
                :
                  <Text style={styles.loginText}>Login</Text>
              }
            </Button>
          </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    width: WIDTH,
  },
  logo: {
    width: '48%',
    height: '22% + 20',
  },
  text: {
    fontSize: 40,
    fontFamily: '$fontLight',
    margin: 15,
    marginBottom: 25,
  },
  inputContainer: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    margin: 5,
    paddingHorizontal: 10,
    width: '75%',
  },
  input: { fontSize: 18 },
  loginButton: {
    margin: 10,
    alignSelf: 'center',
    width: '100%',
  },
  loginText: {
    color: 'white',
    fontSize: 18,
  },
  loading: {
    width: 20,
    height: 20,
  },
});
