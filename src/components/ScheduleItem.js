import React from 'react';
import { View, Text } from 'react-native';
import { CardItem } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { sum } from 'lodash';
import moment from 'moment';

import { getMods } from '../util/processSchedule';
import { MOD_ITEM_HEIGHT } from '../constants/constants';

const isHalfMod = modNumber => modNumber >= 4 && modNumber <= 11;


const ScheduleItem = ({
  title, body, length, cardSchedule, ...scheduleItem
}) => {
  const classMods = getMods(scheduleItem);
  const modHeights = classMods.map(modNumber => (
    MOD_ITEM_HEIGHT / (isHalfMod(modNumber) ? 2 : 1)
  ));
  const scheduleItemHeight = sum(modHeights);

  const [classStart, classEnd] = [
    cardSchedule[classMods[0]][0], cardSchedule[classMods.slice(-1)[0]][1],
  ].map(time => moment(time, 'H:mm').format('h:mm'));

  return (
    <CardItem bordered style={{ height: scheduleItemHeight }}>
      <View style={styles.modIndicator}>
        {
          classMods.map((modNumber, index) => (
            <View key={modNumber} style={[styles.modNumber, { height: modHeights[index] }]}>
              <Text style={styles.bodyText}>{modNumber !== 0 ? modNumber : 'HR'}</Text>
            </View>
          ))
        }
      </View>
      <View style={styles.info}>
        <Text style={styles.timeText}>{classStart} - {classEnd}</Text>
        <View style={styles.classInfoContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {body && <Text style={styles.bodyText}>{body}</Text>}
        </View>
      </View>
    </CardItem>
  );
};
export default ScheduleItem;

const styles = EStyleSheet.create({
  modIndicator: { width: '10%' },
  modNumber: {
    width: '100%',
    justifyContent: 'center',
  },
  info: {
    width: '90%',
    height: '100%',
    alignItems: 'center',
  },
  timeText: {
    position: 'absolute',
    fontFamily: '$fontLight',
    alignSelf: 'flex-end',
  },
  classInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  titleText: {
    fontFamily: '$fontRegular',
    fontSize: 16,
  },
  bodyText: { fontFamily: '$fontLight' },
});
