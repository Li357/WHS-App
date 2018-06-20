import React from 'react';
import { Text, ScrollView, StyleSheet } from 'react-native';
import { Card, CardItem } from 'native-base';
import moment from 'moment';

import ScheduleItem from './ScheduleItem';

const ScheduleCard = ({ content }) => {
  const { day } = content[0]; // Pick day from first element, is 1-based so must -1

  return (
    <Card style={styles.container}>
      <ScrollView>
        <CardItem header>
          <Text>{moment().weekday(day - 1).format('dddd')}</Text>
        </CardItem>
        {content.map(({ sourceId, ...item }) => <ScheduleItem key={sourceId} {...item} />)}
      </ScrollView>
    </Card>
  );
};
export default ScheduleCard;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
