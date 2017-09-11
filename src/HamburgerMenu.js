import React, { Component } from 'react';
import {
  Image,
  TouchableOpacity,
} from 'react-native';
import Hamburger from '../assets/images/hamburger.png';
import EStyleSheet from 'react-native-extended-stylesheet';

class HamburgerMenu extends Component {
  state = {
    open: false
  }

  toggleDrawer = () => {
    this.setState(prevState => ({
      open: !prevState.open
    }));
    this.props.navigation.navigate(`Drawer${this.state.open ? 'Close' : 'Open'}`);
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.toggleDrawer}
        style={styles._hamburger}
      >
        <Image
          source={Hamburger}
          style={styles._hamburgerIcon}
        />
      </TouchableOpacity>
    );
  }
}

const styles = EStyleSheet.create({
  $hamburgerIconSize: 40,
  hamburger: {
    position: 'absolute',
    zIndex: 0,
    height: 40,
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
