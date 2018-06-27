import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CardItem } from 'native-base';

import { getMods } from '../util/processSchedule';
import { MOD_ITEM_HEIGHT } from '../constants/constants';

const CrossSectionItem = ({
  modOccupiedMatrix
}) => (
  const classMods = getMods(scheduleItem);
  const modHeights = classMods.map(modNumber => (
    MOD_ITEM_HEIGHT / (isHalfMod(modNumber) ? 2 : 1)
  ));
  const scheduleItemHeight = sum(modHeights);

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
      <View style={styles.separator} />
      <View style={styles.info}>
        {
          // TODO: Finish cross-section display
          // This maps each occupied mod horizontally
          modOccupiedMatrix.map(crossSectionedMod => (
            <View>
              {
                /**
                 * This array has true / false values based on if the row (occupied mod)
                 * and column (current cross sectioned class being mapped) is occupied
                 */
                crossSectionedMod.map(isOccupied => (
                  <View />
                ))
              }
            </View>
          ))
        }
      </View>
    </CardItem>
  );
);
export default CrossSectionItem;

const styles = StyleSheet.create({
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
    flexDirection: 'row',
  }
});
