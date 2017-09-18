import React, { Component } from 'react';
import {
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

const styles = EStyleSheet.create({
  $hamburgerIconSize: 40,
  hamburger: {
    position: 'absolute',
    zIndex: 1,
    top: 25,
    left: 15,
    backgroundColor: 'transparent'
  },
  hamburgerIcon: {
    width: 40,
    height: 40
  }
});

export default HamburgerMenu;
