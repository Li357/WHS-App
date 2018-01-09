import React from 'react';
import {
  Text,
  View
} from 'react-native';

import {
  alertCrossSectioned,
  getCurrentCrossSectioned
} from './util/crossSection.js';
import infoMap from './util/infoMap.js';

let currentCrossSectioned;

const isHalfMod = modNumber => modNumber < 12 && modNumber > 3;

const InMod = ({
  currentModNumber,
  untilModIsOver,
  nextMod,
  todayCrossSectioned,
  assembly
}) => (
  currentCrossSectioned = getCurrentCrossSectioned(nextMod, todayCrossSectioned),
  <View>
    {
      [
        {
          value: currentModNumber,
          title: `CURRENT ${isHalfMod(currentModNumber) ? 'HALF ' : ''}MOD${assembly ? '' : ' #'}`
        },
        {
          value: untilModIsOver,
          title: `UNTIL ${isHalfMod(currentModNumber) ? 'HALF ' : ''}MOD IS OVER`
        },
        {
          value: nextMod.title,
          title: `NEXT ${isHalfMod(currentModNumber + 1) ? 'HALF ' : ''}MOD`,
          textStyle: {
            fontSize: 60
          },
          isCrossSectioned: currentModNumber < 14 ? currentCrossSectioned.length > 0 : false,
          crossSectionOnPress: () => alertCrossSectioned(nextMod, currentCrossSectioned)
        },
        nextMod.body ? {
          value: nextMod.body,
          title: `NEXT ${isHalfMod(currentModNumber + 1) ? 'HALF ' : ''}MOD ROOM`,
          textStyle: {
            fontSize: 60
          }
        } : {}
      ].map(infoMap)
    }
  </View>
);

export default InMod;
