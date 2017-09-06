import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

const infoMap = ({ value, title }, index) => (
  <View
    key={index}
    style={styles.dashboardInfoContainer}
  >
    <Text
      style={styles.dashboardInfoLarge}
    >{value}</Text>
    <Text style={styles.dashboardInfoSmall}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  dashboardInfoContainer: {
    alignItems: 'center'
  },
  dashboardInfoLarge: {
    fontFamily: 'BebasNeueBook',
    fontSize: 85,
    marginTop: 30
  },
  dashboardInfoSmall: {
    fontFamily: 'BebasNeueBook',
    fontSize: 20,
    marginBottom: 10
  }
});

export default infoMap;
