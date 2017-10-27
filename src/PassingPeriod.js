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
  nextModInfo,
  crossSection
}) => (
  currentCrossSectioned = getCurrentCrossSectioned({ startMod: nextModNumber }, crossSection),
  <View>
    {
      [
        {
          value: untilPassingPeriodIsOver,
          title: 'UNTIL PASSING PERIOD IS OVER'
        },
        {
          value: nextModNumber,
          title: `NEXT ${isHalfMod(nextModNumber) ? 'HALF ' : ''}MOD #`
        },
        {
          value: nextMod,
          title: `NEXT ${isHalfMod(nextModNumber) ? 'HALF ' : ''}MOD`,
          textStyle: {
            fontSize: 60
          },
          crossSection: currentCrossSectioned,
          crossSectionOnPress: () => alertCrossSectioned(currentCrossSectioned)
        },
        nextModInfo ? {
          value: nextModInfo,
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
