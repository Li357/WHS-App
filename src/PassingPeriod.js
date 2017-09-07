import React from 'react';
import {
  Text,
  View
} from 'react-native';

import infoMap from './util/infoMap.js';

const PassingPeriod = ({
  untilPassingPeriodIsOver,
  nextMod,
  nextModInfo
}) => (
  <View>
    {
      [
        {
          value: untilPassingPeriodIsOver,
          title: 'UNTIL PASSING PERIOD IS OVER'
        },
        {
          value: nextMod,
          title: 'NEXT MOD',
          textStyle: {
            fontSize: 60
          }
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

export default PassingPeriod;
