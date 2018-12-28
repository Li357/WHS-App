import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Icon } from 'native-base';
import { withNavigation } from 'react-navigation';

const Hamburger = ({ navigation: { openDrawer } }) => (
  <Button transparent onPress={openDrawer} style={styles.hamburgerContainer}>
    <Icon name="md-menu" style={styles.hamburger} />
  </Button>
);

const NavigationHamburger = withNavigation(Hamburger);
const withHamburger = Child => () => (
  <View style={styles.container}>
    <Child />
    <NavigationHamburger />
  </View>
);
export default withHamburger;

const styles = StyleSheet.create({
  container: { flex: 1 },
  hamburgerContainer: {
    position: 'absolute',
    top: '5%',
    left: '2.5%',
  },
  hamburger: {
    fontSize: 35,
    color: 'black',
  },
});
