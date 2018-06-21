import React, { Component } from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { Card, CardItem } from 'native-base';
import { VerticalBar } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';

import ScheduleItem from './ScheduleItem';

// TODO: Better, more robust solution needed for sizing
const { height } = Dimensions.get('window');
const ITEMS_HEIGHT = height * 0.1 * 14;

export default class ScheduleCard extends Component {
  state = { barHeight: 0 }

  render() {
    const { content } = this.props;
    const { day } = content[0]; // Pick day from first element, is 1-based so must -1
    const date = moment();
    const isCurrentDay = date.day() === day; // Since day() assigns Monday to 1, no -1
    // TODO: Progress for bar is diff(date, beginning of day) / diff(end of day, beginning of day)

    return (
      <Card style={styles.container}>
        <CardItem header style={styles.header}>
          <Text style={styles.day}>{date.weekday(day - 1).format('dddd')} </Text>
          <Text style={styles.date}>{date.format('MMM DD')}</Text>
        </CardItem>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {
              isCurrentDay && // Only show day progress on current day's schedule
                <View style={styles.barContainer}>
                  <VerticalBar progress={0.4} height={ITEMS_HEIGHT} style={styles.bar} />
                </View>
            }
            <View style={{ width: isCurrentDay ? '85%' : '100%' }}>
              {
                content.map(({ sourceId, ...item }) => (
                  <ScheduleItem key={sourceId} {...item} />
                ))
              }
            </View>
          </View>
        </ScrollView>
      </Card>
    );
  }
}

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
  content: { flexDirection: 'row' },
  barContainer: {
    width: '15%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  bar: { width: 6 },
});
