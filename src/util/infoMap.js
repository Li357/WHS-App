import React from 'react';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';

const infoMap = ({
  value,
  title,
  textStyle
}, index) => (
  <View key={index}>
    {
      value && title &&
        <View style={styles.dashboardInfoContainer}>
          <Text
            style={[
              styles.dashboardInfoLarge,
              textStyle
            ]}
          >{value}</Text>
          <Text style={styles.dashboardInfoSmall}>{title}</Text>
        </View>
    }
  </View>
);

const styles = StyleSheet.create({
  dashboardInfoContainer: {
    alignItems: 'center'
  },
  dashboardInfoLarge: {
    fontFamily: 'BebasNeueBook',
    fontSize: 85,
    marginTop: 20,
    textAlign: 'center'
  },
  dashboardInfoSmall: {
    fontFamily: 'BebasNeueBook',
    fontSize: 20,
    marginBottom: 20
  }
});

export default infoMap;
