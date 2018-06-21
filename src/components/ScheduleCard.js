import React, { Component } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Card, CardItem } from 'native-base';
import { VerticalBar } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import moment from 'moment';

import ScheduleItem from './ScheduleItem';

export default class ScheduleCard extends Component {
  state = { barHeight: 0 }

  handleLayout = ({ nativeEvent }) => {
    this.setState({ barHeight: nativeEvent.layout.height });
  }

  render() {
    const { content } = this.props;
    const { barHeight } = this.state;
    const { day } = content[0]; // Pick day from first element, is 1-based so must -1
    const date = moment();
    const isCurrentDay = date.day() === day; // Since day() assigns Monday to 1, no -1

    return (
      <Card style={styles.container}>
        <CardItem header style={styles.header}>
          <Text style={styles.day}>{date.weekday(day - 1).format('dddd')} </Text>
          <Text style={styles.date}>{date.format('MMM DD')}</Text>
        </CardItem>
        <ScrollView showsVerticalScrollIndicator={false} onLayout={this.handleLayout}>
          <View style={styles.content}>
            {
              barHeight && isCurrentDay && // Only show day progress on current day's schedule
                <View style={styles.barContainer}>
                  <VerticalBar progress={0.4} height={barHeight} style={styles.bar} />
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
