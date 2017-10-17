import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { getCurrentCrossSectioned } from './crossSection.js';
import Warning from '../../assets/images/warning.png';

let content;

const infoMap = ({
  value,
  title,
  textStyle,
  crossSection,
  crossSectionOnPress
}, index) => (
  content = (
    <View style={styles.dashboardInfoContainer}>
      <Text
        style={[
          styles.dashboardInfoLarge,
          textStyle
        ]}
      >
        {value}
      </Text>
      <Text style={styles.dashboardInfoSmall}>{title}</Text>
    </View>
  ),
  <View key={index}>
    {
      value && title &&
        (
          crossSection && crossSection.length > 0 ?
            <TouchableOpacity
              onPress={crossSectionOnPress}
              style={[
                styles.dashboardInfoContainer,
                { backgroundColor: 'rgba(255, 255, 102, 0.5)' }
              ]}
            >
              {content}
            </TouchableOpacity>
          :
            <View style={styles.dashboardInfoContainer}>
              {content}
            </View>
        )
    }
  </View>
);

const styles = StyleSheet.create({
  dashboardInfoContainer: {
    alignItems: 'center',
    width: Dimensions.get('window').width
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
