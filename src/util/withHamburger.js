import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Icon } from 'native-base';

const Hamburger = ({ navigation: { openDrawer } }) => (
  <Button transparent onPress={openDrawer} style={styles.hamburgerContainer}>
    <Icon name="md-menu" style={styles.hamburger} />
  </Button>
);

const withHamburger = (Component) => ({ navigation }) => (
  <View style={styles.container}>
    <Component />
    <Hamburger navigation={navigation} />
  </View>
);
export default withHamburger;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hamburgerContainer: {
    position: 'absolute',
    top: '2.5%',
    left: '2.5%',
  },
  hamburger: {
    fontSize: 35,
    color: 'black'
  },
});
