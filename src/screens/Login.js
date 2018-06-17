import React, { Component } from 'react';
import { Alert, Image, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Container, Input, Item, Button, Icon } from 'native-base';
import { connect } from 'react-redux';

import { fetchUserInfo } from '../actions/actionCreators';
import WHSLogo from '../../assets/images/WHS.png';
import Loading from '../../assets/images/loading.gif';

@connect()
export default class Login extends Component {
  state = {
    username: '',
    password: '',
    loggingIn: false,
  }

  handleInput = key => (text) => {
    this.setState({ [key]: text });
  }

  handleLogin = async () => {
    this.setState({ loggingIn: true });

    try {
      const { dispatch, navigation: { navigate } } = this.props;
      const { username, password } = this.state;
      await dispatch(fetchUserInfo(username, password));
      navigate('Dashboard');
    } catch (error) {
      Alert.alert(
        'Error', `${error}`,
        [{ text: 'OK' }],
      );
      // TODO: Alert error & better error reporting
    }
  }

  render() {
    const { loggingIn } = this.state;

    return (
      <Container style={styles.container}>
        <Image source={WHSLogo} style={styles.logo} />
        <Text style={styles.text}>Login to WHS</Text>
        <Item rounded style={styles.inputContainer}>
          <Input
            onChangeText={this.handleInput('username')}
            placeholder="Username"
            style={styles.input}
          />
        </Item>
        <Item rounded style={styles.inputContainer}>
          <Input
            onChangeText={this.handleInput('password')}
            secureTextEntry
            placeholder="Password"
            style={styles.input}
          />
        </Item>
        <Button iconRight danger onPress={this.handleLogin} style={styles.loginButton}>
          <Text style={styles.loginText}>Login</Text>
          {
            loggingIn ?
              <Image source={Loading} style={styles.loading} />
            :
              <Icon name="arrow-forward" />
          }
        </Button>
      </Container>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: '50%',
    height: '25%',
  },
  text: {
    fontSize: 40,
    fontFamily: '$fontLight',
    margin: 15,
    marginBottom: 30,
  },
  inputContainer: {
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: '70%',
    margin: 5,
    paddingLeft: 10,
    paddingRight: 10,
  },
  input: {
    fontSize: 18,
  },
  loginButton: {
    margin: 10,
    alignSelf: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 16,
    marginRight: 10,
  },
  loading: {
    width: 20,
    height: 20,
    marginRight: 16,
  },
});
