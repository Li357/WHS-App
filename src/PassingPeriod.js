import React from 'react';
import {
  Text,
  View
} from 'react-native';

import infoMap from './util/infoMap.js';

const PassingPeriod = ({
  untilPassingPeriodIsOver,
  nextClass
}) => (
  <View>
    {
      [
        {
          value: untilPassingPeriodIsOver,
          title: 'UNTIL PASSING PERIOD IS OVER'
        },
        {
          value: nextClass,
          title: 'NEXT CLASS',
        }
      ].map(infoMap)
    }
  </View>
);

export default PassingPeriod;
