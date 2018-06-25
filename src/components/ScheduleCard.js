import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, CardItem } from 'native-base';
import { VerticalBar } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';

import ScheduleItem from './ScheduleItem';
import selectSchedule from '../util/selectSchedule';
import { MOD_ITEMS_HEIGHT } from '../constants/constants';

export default class ScheduleCard extends Component {
  render() {
    const { content, dayInfo, specialDates } = this.props;
    const { day } = content[0]; // Pick day from first element, is 1-based so must -1
    const date = moment();
    const isCurrentDay = date.day() === day; // Since day() assigns Monday to 1, no -1

    const { start, end, schedule } = dayInfo;
    const cardSchedule = isCurrentDay ? schedule : selectSchedule(specialDates, date);
    let progress;
    if (isCurrentDay) {
      const currentDiff = date.diff(start);

      progress = currentDiff > 0 ? currentDiff / end.diff(start) : 1;
    }

    return (
      <Card style={styles.container}>
        <CardItem header bordered style={styles.header}>
          <Text style={styles.day}>{date.weekday(day - 1).format('dddd')} </Text>
          <Text style={styles.date}>{date.format('MMM DD')}</Text>
        </CardItem>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {
              isCurrentDay && // Only show day progress on current day's schedule
                <View style={styles.barContainer}>
                  <VerticalBar
                    progress={progress}
                    height={MOD_ITEMS_HEIGHT - 20}
                    style={styles.bar}
                  />
                </View>
            }
            <View style={{ width: isCurrentDay ? '85%' : '100%' }}>
              {
                content.map(({ sourceId, ...item }) => (
                  <ScheduleItem key={sourceId} {...item} cardSchedule={cardSchedule} />
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
  header: { width: '100%' },
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
    paddingVertical: 10,
  },
  bar: { width: 6 },
});
