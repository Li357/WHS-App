import React, { Component } from 'react';
import {
  Image,
  TouchableOpacity,
} from 'react-native';
import Hamburger from '../assets/images/hamburger.png';
import EStyleSheet from 'react-native-extended-stylesheet';

class HamburgerMenu extends Component {
  openDrawer = () => {
    this.props.navigation.navigate('DrawerOpen');
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.openDrawer}
        style={styles._hamburger}
      >
        <Image
          source={Hamburger}
          style={{
            width: 40,
            height: 40
          }}
        />
      </TouchableOpacity>
    );
  }
}

const styles = EStyleSheet.create({
  hamburger: {
    position: 'absolute',
    height: 40,
    top: 25,
    left: 15,
    backgroundColor: 'transparent'
  }
});

export default HamburgerMenu;
