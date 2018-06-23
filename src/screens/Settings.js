import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { Icon } from 'native-base';

import waitForAnimation from '../util/waitForAnimation';

@waitForAnimation
export default class Settings extends Component {
  render() {
    return (
      <View />
    );
  }
}

Settings.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="settings" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = StyleSheet.create({
  icon: { fontSize: 20 },
});
