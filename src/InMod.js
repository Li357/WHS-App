import React from 'react';
import {
  Text,
  View
} from 'react-native';

import infoMap from './util/infoMap.js';

const InMod = ({
  currentModNumber,
  untilModIsOver,
  nextMod,
  nextModInfo
}) => (
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

export default InMod;
