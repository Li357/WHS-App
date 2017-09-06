import React from 'react';
import {
  Text,
  View
} from 'react-native';

import infoMap from './util/infoMap.js';

const InMod = ({
  currentMod,
  untilModIsOver,
  nextMod
}) => (
  <View>
    {
      [
        {
          value: currentMod,
          title: 'CURRENT MOD'
        },
        {
          value: untilModIsOver,
          title: 'UNTIL MOD IS OVER'
        },
        {
          value: nextMod,
          title: 'NEXT MOD',
        }
      ].map(infoMap)
    }
  </View>
);

export default InMod;
