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

const isHalfMod = modNumber => modNumber < 12 && modNumber > 3;

const PassingPeriod = ({
  untilPassingPeriodIsOver,
  nextModNumber,
  nextMod,
  todayCrossSectioned,
  assembly
}) => (
  currentCrossSectioned = getCurrentCrossSectioned(nextMod, todayCrossSectioned),
  <View>
    {
      [
        {
          value: untilPassingPeriodIsOver,
          title: 'UNTIL PASSING PERIOD IS OVER'
        },
        !assembly ? {
          value: nextModNumber,
          title: `NEXT ${isHalfMod(nextModNumber) ? 'HALF ' : ''}MOD #`
        } : {},
        {
          value: nextMod.title,
          title: `NEXT ${isHalfMod(nextModNumber) ? 'HALF ' : ''}MOD`,
          textStyle: {
            fontSize: 60
          },
          isCrossSectioned: currentCrossSectioned.length > 0,
          crossSectionOnPress: () => alertCrossSectioned(nextMod, currentCrossSectioned)
        },
        !assembly && nextMod.body ? {
          value: nextMod.body,
          title: `NEXT ${isHalfMod(nextModNumber) ? 'HALF ' : ''}MOD ROOM`,
          textStyle: {
            fontSize: 60
          }
        } : {}
      ].map(infoMap)
    }
  </View>
);

export default PassingPeriod;
