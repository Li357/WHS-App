import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, CardItem } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';

import ScheduleItem from './ScheduleItem';

const ScheduleCard = ({ content }) => {
  const { day } = content[0]; // Pick day from first element, is 1-based so must -1
  const date = moment();

  return (
    <Card style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CardItem header style={styles.header}>
          <Text style={styles.day}>{date.weekday(day - 1).format('dddd')} </Text>
          <Text style={styles.date}>{date.format('MMM DD')}</Text>
        </CardItem>
        <View>
          {/* TODO: Day progress bar here, ~15% width */}
          {
            content.map(({ sourceId, ...item }) => (
              <ScheduleItem key={sourceId} {...item} style={styles.item} />
            ))
          }
        </View>
      </ScrollView>
    </Card>
  );
};
export default ScheduleCard;

const styles = EStyleSheet.create({
  container: { flex: 1 },
  header: { alignSelf: 'flex-end' },
  day: {
    fontFamily: '$fontRegular',
    fontSize: 18,
  },
  date: {
    fontFamily: '$fontThin',
    fontSize: 18,
  },
  item: {
    width: '80%',
    alignSelf: 'flex-end',
  },
});
