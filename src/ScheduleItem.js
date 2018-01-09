import React from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import {
  alertCrossSectioned,
  getCurrentCrossSectioned,
  getOverlappingMods,
  getClassMods
} from './util/crossSection.js';

let isHalfMod;
let currentCrossSectionedMods;
let textStyleObj;
let calculatedWidth;
let content;
let items;
let specialItems;
let visible;
let position;

const checkIfHalf = mod => mod >= 4 && mod <= 11;
const range = (start, end) => Array.from(new Array(end - start), (_, i) => i + start);
const getModHeight = (sum, mod) => sum +  75 / (checkIfHalf(mod) + 1);

const { width } = Dimensions.get('window');

const ScheduleItem = ({
  scheduleItem,
  crossSectionedMods,
  textStyle,
  startModNumber,
  isFinals
}) => (
  currentCrossSectionedMods = getCurrentCrossSectioned(scheduleItem, crossSectionedMods),
  textStyleObj = {
    opacity: textStyle
  },
  items = ({ title, body, length, startMod, sourceType }, hasModIndicator, index, modLength) => (
    calculatedWidth = modLength && { width: width * 0.75 * 85 / modLength },
    <View key={index}>
      <View style={[
          styles._scheduleCardWrappedTextContainer,
          modLength && {
            left: index > 0 ? 0 : width * 0.11
          }
      ]}>
        <Animated.Text style={[
          styles._scheduleCardWrappedText,
          textStyleObj,
          modLength && {
            fontSize: 15
          }
        ]}>
          {title}
        </Animated.Text>
        {
          body &&
            <Animated.Text style={[
              styles._scheduleCardWrappedText,
              textStyleObj,
              modLength && {
                fontSize: 15
              }
            ]}>
              {body}
            </Animated.Text>
        }
      </View>
      {
        range(0, length).map(key =>
          (
            isHalfMod = startMod + key >= 4 && startMod + key <= 11,
            <View
              key={key}
              style={[
                styles._scheduleCardItemContainer,
                isHalfMod && !isFinals && {
                  height: 75 / 2
                },
                currentCrossSectionedMods.length > 0 && {
                  backgroundColor: 'rgba(255, 255, 102, 0.5)'
                }
              ]}
            >
              {
                hasModIndicator &&
                  <Animated.Text style={[
                    styles._scheduleCardItemMod,
                    currentCrossSectionedMods.length > 0 && {
                      width: width * 0.7 * 0.15
                    },
                    isHalfMod && !isFinals && {
                      paddingTop: (75 / 2 - 17) / 2,
                      paddingBottom: (75 / 2 - 17) / 2,
                    },
                    textStyleObj
                  ]}>
                    {startMod === 0 ? 'HR' : startMod + key + startModNumber}
                  </Animated.Text>
              }
              <View
                style={[
                  styles._scheduleCardItem,
                  title === 'OPEN MOD' && {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  },
                  sourceType === 'annotation' && {
                    backgroundColor: 'darkgray'
                  },
                  isHalfMod && !isFinals && {
                    height: 75 / 2
                  },
                  modLength && {
                    width: width * 0.7 * 0.842 / modLength
                  },
                  modLength && modLength !== index + 1 && {
                    borderRightColor: 'gray',
                    borderRightWidth: 1
                  }
                ]}
              />
            </View>
          )
        )
      }
    </View>
  ),
  specialItems = (scheduleItems, { length, startMod, endMod }) => (
    calculatedWidth = { width: width * 0.7 * 0.85 / scheduleItems.length },
    <View style={styles._scheduleCardItemSpecialContainer}>
      {
        scheduleItems.map(({ startMod: itemStart, endMod: itemEnd, title, body }, index) =>
          (
            position = index + 1 - Math.ceil(length / 2),
            <View
              key={index}
              style={[
                styles._scheduleCardWrappedTextContainer,
                { // this assumes nobody has a cross-section of >3 classes
                  left: `${Math.sign(position) * (position * 15 + width * 0.45 / length) + (position === 0 ? 15 : 0)}%`,
                  top: +(itemStart > startMod) && range(startMod, itemStart).reduce(getModHeight, 0),
                  bottom: +(itemEnd < endMod) && range(itemEnd, endMod).reduce(getModHeight, 0)
                }
              ]}
            >
              <Animated.Text style={[
                styles._scheduleCardWrappedText,
                textStyleObj,
                calculatedWidth,
                { fontSize: 15 }
              ]}>
                {title}
              </Animated.Text>
              {
                body &&
                  <Animated.Text style={[
                    styles._scheduleCardWrappedText,
                    textStyleObj,
                    calculatedWidth,
                    { fontSize: 15 }
                  ]}>
                    {body}
                  </Animated.Text>
              }
            </View>
          )
        )
      }
      {
        range(0, length).map(key =>
          (
            isHalfMod = startMod + key >= 4 && startMod + key <= 11,
            scheduleItems.map((item, index, { length: modLength }) =>
              (
                visible = getClassMods(item).includes(key + startMod),
                <View
                  key={`${key} ${index}`}
                  style={[
                    styles._scheduleCardItemContainer,
                    isHalfMod && !isFinals && {
                      height: 75 / 2
                    }
                  ]}
                >
                  {
                    index === 0 &&
                      <Animated.Text style={[
                        styles._scheduleCardItemMod,
                        {
                          width: width * 0.7 * 0.15
                        },
                        isHalfMod && !isFinals && {
                          paddingTop: (75 / 2 - 17) / 2,
                          paddingBottom: (75 / 2 - 17) / 2,
                        },
                        textStyleObj
                      ]}>
                        {item.startMod === 0 ? 'HR' : item.startMod + key + startModNumber}
                      </Animated.Text>
                  }
                  <View
                    style={[
                      visible && styles._scheduleCardItem,
                      item.sourceType === 'annotation' && visible && {
                        backgroundColor: 'darkgray'
                      },
                      isHalfMod && !isFinals && {
                        height: 75 / 2
                      },
                      {
                        width: width * 0.7 * 0.842 / modLength
                      },
                      index !== modLength - 1 && visible && {
                        borderRightColor: 'gray',
                        borderRightWidth: 1,
                      }
                    ]}
                  />
                </View>
              )
            )
          )
        )
      }
    </View>
  ),
  <View style={[
    styles._scheduleCardWrappedContainer,
    currentCrossSectionedMods.length > 0 && styles._scheduleCardItemContainer
  ]}>
    {
      currentCrossSectionedMods.length > 0 ?
        scheduleItem.irregular ?
          specialItems([scheduleItem.unmodified, ...currentCrossSectionedMods], scheduleItem)
        :
          [
            scheduleItem,
            ...currentCrossSectionedMods
          ].map((scheduleItem, index, { length }) => items(scheduleItem, index < 1, index, length))
      :
        items(scheduleItem, true, 0)
    }
  </View>
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
    left: '15%',
    right: 0,
    bottom: 0
  },
  scheduleCardWrappedText: {
    fontFamily: 'BebasNeueBook',
    fontSize: 17,
    textAlign: 'center'
  },
  scheduleCardItemContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row'
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
  },
  scheduleCardItemSpecialContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 102, 0.5)'
  }
});

export default ScheduleItem;
