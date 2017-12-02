import React, { Component } from 'react';
import {
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import Hamburger from '../assets/images/hamburger.png';

const HamburgerMenu = ({ navigation }) => (
  <TouchableOpacity
    onPress={() => navigation.navigate('DrawerOpen')}
    style={styles._hamburger}
  >
    <Image
      source={Hamburger}
      style={styles._hamburgerIcon}
    />
  </TouchableOpacity>
);

const { height } = Dimensions.get('window');

const styles = EStyleSheet.create({
  $hamburgerIconSize: 40,
  hamburger: {
    position: 'absolute',
    zIndex: 1,
    top: height === 812 ? 40 : 25, //Handles iPhone X
    left: height === 812 ? 25 : 15,
    backgroundColor: 'transparent'
  },
  hamburgerIcon: {
    width: 40,
    height: 40
  }
});

export default HamburgerMenu;
