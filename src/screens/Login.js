import React, { Component } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Container, Content, Input, Item } from 'native-base';

import WHSLogo from '../../assets/images/WHS.png';

export default class Login extends Component {
  render() {
    return (
      <Container style={styles.container}>
        <Image source={WHSLogo} style={styles.logo} />
        <Text style={styles.text}>Login to WHS</Text>
        <Item rounded style={styles.inputContainer}>
          <Input placeholder="Username" style={styles.input} />
        </Item>
        <Item rounded style={styles.inputContainer}>
          <Input secureTextEntry placeholder="Password" style={styles.input} />
        </Item>
      </Container>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '50%',
    height: '25%',
  },
  text: {
    fontSize: 40,
    fontFamily: 'Roboto-Thin',
    margin: 15,
    marginBottom: 40,
  },
  inputContainer: {
    borderWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    width: '70%',
    margin: 7,
    paddingLeft: 10,
    paddingRight: 10,
  },
  input: {
    fontSize: 18,
  },
});
