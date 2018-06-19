import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Icon } from 'native-base';

export default class Schedule extends Component {
  render() {
    return null;
  }
}

Schedule.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="schedule" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = StyleSheet.create({
  icon: { fontSize: 20 },
});
