import React from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {
  alertCrossSectioned,
  getCurrentCrossSectioned
} from './util/crossSection.js';
import Warning from '../assets/images/warning.png';

let isHalfMod;
let currentCrossSectionedMods;
let content;

const ScheduleItem = ({
  scheduleItem,
  crossSectionedMods
}) => (
  currentCrossSectionedMods = getCurrentCrossSectioned(scheduleItem, crossSectionedMods),
  content = (
    <View style={styles._scheduleCardWrappedContainer}>
      <View style={styles._scheduleCardWrappedTextContainer}>
        <Text style={styles._scheduleCardWrappedText}>{scheduleItem.title}</Text>
        {
          scheduleItem.body &&
            <Text style={styles._scheduleCardWrappedText}>{scheduleItem.body}</Text>
        }
      </View>
      {
        Array.from(new Array(scheduleItem.length), (_, i) => i).map(key =>
          (
            isHalfMod = scheduleItem.startMod + key >= 4 && scheduleItem.startMod + key <= 11,
            <View
              key={key}
              style={[
                styles._scheduleCardItemContainer,
                isHalfMod ? {
                  height: 75 / 2
                } : {},
                currentCrossSectionedMods.length > 0 ? {
                  backgroundColor: 'rgba(255, 255, 102, 0.5)'
                } : {}
              ]}
            >
              {
                currentCrossSectionedMods.length > 0 &&
                  <View style={styles._scheduleModWarningContainer}>
                    <Image
                      source={Warning}
                      style={styles._scheduleModWarning}
                    />
                  </View>
              }
              <Text style={[
                styles._scheduleCardItemMod,
                isHalfMod ? {
                  paddingTop: (75 / 2 - 17) / 2,
                  paddingBottom: (75 / 2 - 17) / 2,
                } : {},
                currentCrossSectionedMods.length > 0 ? {
                  width: Dimensions.get('window').width * 0.65 * 0.0694
                } : {}
              ]}>
                {scheduleItem.startMod === 0 ? 'HR' : scheduleItem.startMod + key}
              </Text>
              <View
                style={[
                  styles._scheduleCardItem,
                  scheduleItem.title === 'OPEN MOD' ? {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  } : {},
                  isHalfMod ? {
                    height: 75 / 2
                  } : {}
                ]}
              />
            </View>
          )
        )
      }
    </View>
  ),
  currentCrossSectionedMods.length > 0 ?
    <TouchableOpacity
      onPress={() => alertCrossSectioned(getCurrentCrossSectioned(scheduleItem, crossSectionedMods))}
    >
      {content}
    </TouchableOpacity>
  :
    content
);

const styles = EStyleSheet.create({
  scheduleCardWrappedContainer: {
    width: '100%',
    borderColor: 'gray',
    borderWidth: 1,
    backgroundColor: 'transparent'
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
    fontSize: 17
  },
  scheduleCardItemContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    height: 75
  },
  scheduleModWarningContainer: {
    width: '7.75%'
  },
  scheduleModWarning: {
    width: 12,
    height: 12,
    marginTop: 31,
    marginLeft: 2.5
  },
  scheduleCardItemMod: {
    width: '15%',
    paddingTop: 29,
    paddingBottom: 29,
    paddingRight: 8,
    fontFamily: 'Roboto-Light',
    textAlign: 'right'
  },
  scheduleCardItem: {
    width: '85%',
    height: 75,
    backgroundColor: 'lightgray'
  }
});

export default ScheduleItem;
