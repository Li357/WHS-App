import React, { PureComponent } from 'react';
import { Animated, Alert, KeyboardAvoidingView, Image, Text, Dimensions, Easing } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Form, Input, Item, Button } from 'native-base';
import { connect } from 'react-redux';

import { fetchUserInfo } from '../actions/actionCreators';
import logo from '../../assets/images/WHS.png';
import loading from '../../assets/images/loading.gif';

const { width } = Dimensions.get('window');
const mapStateToProps = ({ loginError }) => ({ loginError });

@connect(mapStateToProps)
export default class Login extends PureComponent {
  state = {
    username: '',
    password: '',
    loggingIn: false,
    opacity: new Animated.Value(0),
    loginWidth: new Animated.Value(width * 0.75),
    loginAnimDone: false,
  }

  componentDidMount() {
    Animated.timing(this.state.opacity, {
      toValue: 1, duration: 3000,
    }).start();
  }

  handleInput = key => (text) => {
    this.setState({ [key]: text });
  }

  handleLogin = async () => {
    this.setState({ loggingIn: true });

    // TODO: Find more permanent solution than just * 0.2
    Animated.timing(this.state.loginWidth, {
      easing: Easing.sin, toValue: width * 0.2 * 0.75, duration: 250,
    }).start(() => {
      this.setState({ loginAnimDone: true });
    });

    try {
      const { dispatch, navigation: { navigate } } = this.props;
      const { username, password } = this.state;
      const success = await dispatch(fetchUserInfo(username, password));
      if (success) {
        navigate('Dashboard');
        return;
      }
      // Reverse animation if login failure
      Animated.timing(this.state.loginWidth, {
        toValue: width * 0.75, duration: 250,
      }).start(() => {
        this.setState({
          loggingIn: false,
          loginAnimDone: false,
        });
      });
    } catch (error) {
      Alert.alert(
        'Error', `${error}`,
        [{ text: 'OK' }],
      );
      // TODO: Alert error & better error reporting
    }
  }

  render() {
    const {
      loggingIn, opacity, loginWidth, loginAnimDone, username, password,
    } = this.state;
    const { loginError } = this.props;

    // TODO: Test keyboard offset on Android & make more dynamic
    return (
      <KeyboardAvoidingView behavior="position" keyboardVerticalOffset={-width * 0.45} style={styles.container}>
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
                paddingHorizontal: loginAnimDone ? 6 : 0,
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
                  // TODO: Use react-native-progress instead of image
                  <Image source={loading} style={styles.loading} />
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
    width, // For some reason this doesn't work with '100%'
  },
  logo: {
    width: '48%',
    height: '22%',
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
