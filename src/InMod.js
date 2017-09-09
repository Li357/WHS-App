import React from 'react';
import {
  Text,
  View
} from 'react-native';

import infoMap from './util/infoMap.js';

const InMod = ({
  currentMod,
  untilModIsOver,
  nextMod,
  nextModInfo
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
        },
        ...(nextModInfo ? {
          value: nextModInfo,
          title: 'NEXT MOD ROOM'
        } : {})
      ].map(infoMap)
    }
  </View>
);

export default InMod;
