import React from 'react';
import {
  Text,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

const ScheduleItem = ({ scheduleItem }) => (
  <View style={styles._scheduleCardWrappedContainer}>
    <View style={styles._scheduleCardWrappedTextContainer}>
      <Text style={styles._scheduleCardWrappedText}>{scheduleItem.title}</Text>
      {
        scheduleItem.body &&
          <Text style={styles._scheduleCardWrappedText}>{scheduleItem.body}</Text>
      }
    </View>
    {
      [...Array(scheduleItem.length).keys()].map(key =>
        <View
          key={key}
          style={[
            styles._scheduleCardItemContainer,
            scheduleItem.startMod + key >= 4 && scheduleItem.startMod + key <= 11 ? {
              height: 75 / 2
            } : {}
          ]}
        >
          <Text style={[
            styles._scheduleCardItemMod,
            scheduleItem.startMod + key >= 4 && scheduleItem.startMod + key <= 11 ? {
              paddingTop: (75 / 2 - 17) / 2,
              paddingBottom: (75 / 2 - 17) / 2,
            } : {}
          ]}>{scheduleItem.startMod === 0 ? 'HR' : scheduleItem.startMod + key}</Text>
          <View
            style={[
              styles._scheduleCardItem,
              scheduleItem.title === 'OPEN MOD' ? {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              } : {},
              scheduleItem.startMod + key >= 4 && scheduleItem.startMod + key <= 11 ? {
                height: 75 / 2
              } : {}
            ]}
          />
        </View>
      )
    }
  </View>
);

const styles = EStyleSheet.create({
  scheduleCardWrappedContainer: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1
  },
  scheduleCardWrappedTextContainer: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 30,
    right: 0,
    bottom: 0
  },
  scheduleCardWrappedText: {
    fontFamily: 'BebasNeueBook',
    fontSize: 17,
  },
  scheduleCardItemContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    height: 75
  },
  scheduleCardItemMod: {
    width: '14%',
    paddingTop: 29,
    paddingBottom: 29,
    paddingRight: 9,
    fontFamily: 'RobotoLight',
    textAlign: 'right'
  },
  scheduleCardItem: {
    width: '86%',
    height: 75,
    backgroundColor: 'lightgray'
  }
});

export default ScheduleItem;
