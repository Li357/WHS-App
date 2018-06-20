import React from 'react';
import { Text, StyleSheet, Dimensions } from 'react-native';
import { CardItem } from 'native-base';

const { height } = Dimensions.get('window');
const ScheduleItem = ({ body, length }) => (
  <CardItem
    bordered
    style={[
      styles.item, { height: height * 0.1 * length },
    ]}
  >
    <Text>{body}</Text>
  </CardItem>
);
export default ScheduleItem;

const styles = StyleSheet.create({
  item: {
    justifyContent: 'center',
  },
});
