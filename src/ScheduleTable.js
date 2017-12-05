import React, { Component } from 'react';
import {
  Dimensions,
  Text,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

const ScheduleTable = ({ schedule }) => (
      schedule.map((timePair, index) =>
        <View
          key={index}
          style={styles._scheduleTableItem}
        >
          <Text>{timePair[0]}</Text>
          <Text>{timePair[1]}</Text>
        </View>
      )
    }
  </View>
);

const {
  width,
  height
} = Dimensions.get('window');

const styles = EStyleSheet.create({
  scheduleTableContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width,
    height
  },
  scheduleTableItem: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    height: 40,
    width: '65%',
    borderColor: 'gray',
    borderWidth: 1
  }
});

export default ScheduleTable;
