import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { CardItem } from 'native-base';

const { height } = Dimensions.get('window');
const ScheduleItem = ({ body, title, length }) => (
  <CardItem style={{ height: height * 0.1 * length }}>
    <View>
      <Text>{title}</Text>
      <Text>{body}</Text>
    </View>
  </CardItem>
);
export default ScheduleItem;
