import React from 'react';
import { View, Text } from 'react-native';
import { CardItem } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { sum } from 'lodash';

import { getMods } from '../util/processSchedule';
import { isHalfMod, decodeUnicode } from '../util/querySchedule';
import { MOD_ITEM_HEIGHT, ASSEMBLY_MOD } from '../constants/constants';

const ScheduleItem = ({
  isLastDay, isFinals, hasAssembly, isAfterAssembly, title, body, length, ...scheduleItem
}) => {
  const classMods = getMods(scheduleItem);
  const modHeights = classMods.map(modNumber => (
    // On finals days, none are half mods (homeroom is a 'half mod')
    MOD_ITEM_HEIGHT / (
      (!isFinals && isHalfMod(modNumber - Number(isAfterAssembly))) || modNumber === 0
        ? 2 : 1
    )
  ));
  const scheduleItemHeight = sum(modHeights);

  return (
    <CardItem bordered style={[styles.item, { height: scheduleItemHeight }]}>
      <View style={styles.modIndicator}>
        {
          classMods.map((modNumber, index) => {
            const number = modNumber !== 0
              // This displays mods 5 - 8 (finals mods) on the last day, shifts one for assembly
              ? (modNumber + (isLastDay ? 4 : 0)) - Number(isAfterAssembly)
              : 'HR';
            const displayMod = title === 'Assembly' ||
              (hasAssembly && scheduleItem.startMod === ASSEMBLY_MOD) // Handles timestable 'AS'
                ? 'AS'
                : number;

            return (
              <View key={modNumber} style={[styles.modNumber, { height: modHeights[index] }]}>
                <Text style={styles.bodyText}>{displayMod}</Text>
              </View>
            );
          })
        }
      </View>
      <View style={styles.separator} />
      <View style={styles.info}>
        <View style={styles.textContainer}>
          <Text style={styles.titleText}>{decodeUnicode(title)}</Text>
          {body && <Text style={styles.bodyText}>{body}</Text>}
        </View>
      </View>
    </CardItem>
  );
};
export default ScheduleItem;

const styles = EStyleSheet.create({
  item: {
    borderBottomWidth: 0.5,
    borderTopWidth: 0.5,
  },
  modIndicator: { width: '12.5%' },
  modNumber: {
    width: '100%',
    justifyContent: 'center',
  },
  separator: {
    height: '100%',
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
