import React, { Component } from 'react';
import {
  Dimensions,
  Text,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

const ScheduleTable = ({ schedule }) => (
  <View style={styles._scheduleTableContainer}>
    {
      schedule.map((timePair, index) =>
        <Text key={index}>{timePair[0]} - {timePair[1]}</Text>
      )
    }
  </View>
);

const styles = EStyleSheet.create({
  scheduleTableContainer: {
    flex: 1,
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  }
});

export default ScheduleTable;
