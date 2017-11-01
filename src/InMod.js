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
  nextModInfo,
  crossSection,
  assembly
}) => (
  currentCrossSectioned = getCurrentCrossSectioned({ startMod: currentModNumber + 1 }, crossSection),
  <View>
    {
      [
        {
          value: currentModNumber,
          title: `CURRENT MOD${assembly ? '' : ' #'}`
        },
        {
          value: untilModIsOver,
          title: `UNTIL ${isHalfMod(currentModNumber) ? 'HALF ' : ''}MOD IS OVER`
        },
        {
          value: nextMod,
          title: `NEXT ${isHalfMod(currentModNumber + 1) ? 'HALF ' : ''}MOD`,
          textStyle: {
            fontSize: 60
          },
          crossSection: currentModNumber < 14 ? currentCrossSectioned : null,
          crossSectionOnPress: () => alertCrossSectioned(currentCrossSectioned)
        },
        nextModInfo ? {
          value: nextModInfo,
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
