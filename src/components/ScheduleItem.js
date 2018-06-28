import React from 'react';
import { View, Text } from 'react-native';
import { CardItem } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { sum } from 'lodash';

import { getMods } from '../util/processSchedule';
import { isHalfMod } from '../util/querySchedule';
import { MOD_ITEM_HEIGHT } from '../constants/constants';

const ScheduleItem = ({
  title, body, length, ...scheduleItem
}) => {
  const classMods = getMods(scheduleItem);
  const modHeights = classMods.map(modNumber => (
    MOD_ITEM_HEIGHT / (isHalfMod(modNumber) ? 2 : 1)
  ));
  const scheduleItemHeight = sum(modHeights);

  return (
    <CardItem bordered style={[styles.item, { height: scheduleItemHeight }]}>
      <View style={styles.modIndicator}>
        {
          classMods.map((modNumber, index) => (
            <View key={modNumber} style={[styles.modNumber, { height: modHeights[index] }]}>
              <Text style={styles.bodyText}>{modNumber !== 0 ? modNumber : 'HR'}</Text>
            </View>
          ))
        }
      </View>
      <View style={styles.separator} />
      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{title}</Text>
          {body && <Text style={styles.bodyText}>{body}</Text>}
        </View>
      </View>
    </CardItem>
  );
};
export default ScheduleItem;

const styles = EStyleSheet.create({
  modIndicator: { width: '12.5%' },
  modNumber: {
    width: '100%',
    justifyContent: 'center',
  },
  separator: {
    height: '90%',
    borderLeftColor: 'lightgrey',
    borderLeftWidth: 1,
    marginRight: 15,
  },
  info: {
    flexGrow: 1,
    alignItems: 'center',
    alignSelf: 'center',
  },
  textContainer: {
    width: '85%',
    alignItems: 'center',
  },
  titleText: {
    textAlign: 'center',
    fontFamily: '$fontRegular',
    fontSize: 16,
  },
  bodyText: { fontFamily: '$fontLight' },
});
