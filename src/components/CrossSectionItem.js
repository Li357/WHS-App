import React from 'react';
import { View, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { CardItem } from 'native-base';
import { sum } from 'lodash';

import { isHalfMod, decodeUnicode } from '../util/querySchedule';
import { MOD_ITEM_HEIGHT } from '../constants/constants';

const CrossSectionItem = ({
  isAfterAssembly, occupiedMods, crossSectionedColumns,
}) => {
  const exclusiveMods = occupiedMods.slice(0, -1);
  const modHeights = exclusiveMods.map(modNumber => (
    MOD_ITEM_HEIGHT / (isHalfMod(modNumber - Number(isAfterAssembly)) ? 2 : 1)
  ));
  const scheduleItemHeight = sum(modHeights);

  return (
    <CardItem bordered style={[styles.item, { height: scheduleItemHeight }]}>
      <View style={styles.modIndicator}>
        {
          exclusiveMods.map((modNumber, index) => (
            <View key={modNumber} style={[styles.modNumber, { height: modHeights[index] }]}>
              <Text style={styles.bodyText}>
                {modNumber !== 0 ? modNumber - Number(isAfterAssembly) : 'HR'}
              </Text>
            </View>
          ))
        }
      </View>
      <View style={styles.separator} />
      <View style={styles.info}>
        {
          /**
           * This maps each occupied mod horizontally
           * Subtract 20 to account for padding (10 for top and bottom)
           */
          /* eslint-disable react/no-array-index-key */
          crossSectionedColumns.map((column, colIndex, { length: colLength }) => (
            <View
              key={colIndex}
              style={[
                styles.column,
                {
                  width: `${87.5 / colLength}%`,
                  borderRightColor: colIndex !== colLength - 1 ? 'lightgrey' : 'white',
                  borderRightWidth: Number(colIndex !== colLength - 1),
                },
                column.length === 0 && styles.empty,
              ]}
            >
              {
                /* eslint-enable react/no-array-index-key */
                /**
                 * This array has true / false values based on if the row (occupied mod)
                 * and column (current cross sectioned class being mapped) is occupied
                 */
                column.map(({
                  sourceId, length, startMod, endMod, title, body,
                }, index, array) => {
                  const nextItem = array[index + 1];
                  const prevItem = array[index - 1];
                  const ratio = nextItem ? nextItem.startMod - endMod : 0;
                  // TODO: Calculate flex (2 for full, 1 for half)
                  return (
                    <View key={sourceId} style={{ flex: ratio + length }}>
                      {
                        /**
                         * This pads the column if the first item in the column does not start at
                         * beginning of cross sectioned block
                         */
                        !prevItem && startMod !== occupiedMods[0] &&
                          <View style={[styles.empty, { flex: startMod - occupiedMods[0] }]} />
                      }
                      <View style={[styles.modItem, { flex: length }]}>
                        <Text style={styles.titleText}>{decodeUnicode(title)}</Text>
                        <Text style={styles.bodyText}>{body}</Text>
                      </View>
                      {
                        /**
                         * This pads the column after, handling cases where there's a gap or until
                         * the end of the cross sectioned block
                         */
                      }
                      <View style={[styles.empty, { flex: ratio }]} />
                    </View>
                  );
                })
              }
            </View>
          ))
        }
      </View>
    </CardItem>
  );
};
export default CrossSectionItem;

const styles = EStyleSheet.create({
  item: {
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
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
  },
  info: {
    flexDirection: 'row',
    height: '100%',
  },
  column: { flexGrow: 1 },
  modItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgrey',
  },
  titleText: {
    textAlign: 'center',
    fontFamily: '$fontRegular',
    fontSize: 16,
  },
  bodyText: { fontFamily: '$fontLight' },
  empty: { backgroundColor: 'rgba(0, 0, 0, 0.05)' },
});
