import React from 'react';
import { View, Dimensions } from 'react-native';
import { CardItem } from 'native-base';

const { height } = Dimensions.get('window');
const ScheduleItem = ({ length, style }) => (
  <CardItem style={[style, { height: height * 0.2 * length }]}>
    <View>
      {/* TODO: Content */}
    </View>
  </CardItem>
);
export default ScheduleItem;
