import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

let content;

const infoMap = ({
  value,
  title,
  textStyle,
  isCrossSectioned,
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
          isCrossSectioned ?
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
