import React, { Component } from 'react';
import { View, Image, Text, ScrollView } from 'react-native';
import { Container } from 'native-base';
import { DrawerItems, SafeAreaView } from 'react-navigation';
import ReactNativeParallaxHeader from 'react-native-parallax-header';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';

import Background from '../../assets/images/background.jpg';

export default class DrawerContent extends Component {
  render() {
    return (
      <Container style={styles.container}>
        <Image source={Background} style={styles.header} />
        <Text style={styles.date}>{moment().format('MMMM D, YYYY')}</Text>
        <DrawerItems {...this.props} />
      </Container>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignSelf: 'stretch',
    width: null,
    position: 'relative',
    height: '30%',
  },
  date: {
    position: 'absolute',
    top: '23%',
    left: '5%',
    fontSize: 35,
    color: 'white',
    fontFamily: '$fontLight'
  },
});
