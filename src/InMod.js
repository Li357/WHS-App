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

const InMod = ({
  currentModNumber,
  untilModIsOver,
  nextMod,
  nextModInfo,
  crossSection
}) => (
  currentCrossSectioned = getCurrentCrossSectioned({ startMod: currentModNumber + 1 }, crossSection),
  <View>
    {
      [
        {
          value: currentModNumber,
          title: 'CURRENT MOD #'
        },
        {
          value: untilModIsOver,
          title: 'UNTIL MOD IS OVER'
        },
        {
          value: nextMod,
          title: 'NEXT MOD',
          textStyle: {
            fontSize: 60
          },
          crossSection: currentModNumber < 14 ? currentCrossSectioned : null,
          crossSectionOnPress: () => alertCrossSectioned(currentCrossSectioned)
        },
        nextModInfo ? {
          value: nextModInfo,
          title: 'NEXT MOD ROOM',
          textStyle: {
            fontSize: 60
          }
        } : {}
      ].map(infoMap)
    }
  </View>
);

export default InMod;
