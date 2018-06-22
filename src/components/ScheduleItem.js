import React from 'react';
import { View, Text } from 'react-native';
import { CardItem } from 'native-base';

import { getMods } from '../util/processSchedule';
import { MOD_ITEM_HEIGHT } from '../constants/constants';

const isHalfMod = modNumber => modNumber >= 4 && modNumber <= 11;

const ScheduleItem = ({
  title, body, length, ...scheduleItem
}) => {
  const classMods = getMods(scheduleItem);
  const scheduleItemHeight = classMods.reduce((acc, mod) => (
    acc + (MOD_ITEM_HEIGHT / (isHalfMod(mod) ? 2 : 1))
  ), 0);

  return (
    <CardItem bordered style={{ height: scheduleItemHeight }}>
      <View>
        <Text>{title}</Text>
        <Text>{body}</Text>
      </View>
    </CardItem>
  );
};
export default ScheduleItem;
