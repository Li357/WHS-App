import React, { Component } from 'react';
import { AppState, Switch, View, Text, ScrollView } from 'react-native';
import { Card, CardItem } from 'native-base';
import { VerticalBar } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import { withNavigation } from 'react-navigation';
import moment from 'moment';

import ScheduleItem from './ScheduleItem';
import { selectSchedule } from '../util/querySchedule';
import { MOD_ITEMS_HEIGHT, MOD_ITEM_HEIGHT } from '../constants/constants';

@withNavigation
export default class ScheduleCard extends Component {
  constructor(props) {
    super(props);
    this.focusSubscriber = this.props.navigation.addListener('didFocus', this.updateProgress);
    AppState.addEventListener('change', this.handleAppStateChange);

    const { dayInfo: { start, end } } = this.props;
    const date = moment();
    this.state = {
      showTimes: false,
      progress: date.isBefore(start) ? 0 : date.diff(start) / end.diff(start),
    };
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.focusSubscriber.remove();
  }

  handleAppStateChange = (newStatus) => {
    if (newStatus === 'active') {
      this.updateProgress();
    }
  }

  updateProgress = () => {
    const date = moment();
    const { dayInfo: { start, end } } = this.props;
    this.setState({
      progress: date.isBefore(start) ? 0 : date.diff(start) / end.diff(start),
    });
  }

  handleSwitch = (showTimes) => {
    this.setState({ showTimes });
  }

  render() {
    const { content, dayInfo: { schedule }, specialDates } = this.props;
    const { showTimes, progress } = this.state;
    const { day } = content[0]; // Pick day from first element, is 1-based so must -1
    const date = moment();
    const isCurrentDay = date.day() === day; // Since day() assigns Monday to 1, no -1
    const isWednesday = day === 3;
    const cardDate = date.clone().weekday(day - 1);

    const cardSchedule = isCurrentDay ? schedule : selectSchedule(specialDates, cardDate);
    const format = time => moment(time, 'k:mm').format('h:mm');
    /* eslint-disable indent */
    const scheduleToShow = showTimes
      ? cardSchedule.map((timePair, index) => ({
          title: timePair.map(format).join(' - '),
          length: 1,
          // Shift mod numbers +1 on Wednesdays (no homeroom)
          startMod: index + Number(isWednesday),
          endMod: index + 1 + Number(isWednesday),
          sourceId: index,
        }))
      // Don't show No Homeroom on ScheduleCard
      : content.filter(({ title }) => title !== 'No Homeroom');
    /* eslint-enable indent */

    return (
      <Card style={styles.container}>
        <CardItem header bordered style={styles.header}>
          <Text style={styles.day}>{cardDate.format('dddd')} </Text>
          <Text style={styles.date}>{cardDate.format('MMM DD')}</Text>
          <Switch
            value={this.state.showTimes}
            onValueChange={this.handleSwitch}
            style={styles.timeSwitch}
          />
        </CardItem>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {
              isCurrentDay && // Only show day progress on current day's schedule
                <View style={styles.barContainer}>
                  <VerticalBar
                    progress={progress}
                    height={MOD_ITEMS_HEIGHT - 20 - (isWednesday ? MOD_ITEM_HEIGHT : 0)}
                    style={styles.bar}
                  />
                </View>
            }
            <View style={{ width: isCurrentDay ? '85%' : '100%' }}>
              {
                scheduleToShow.map(({ sourceId, ...item }) => (
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
  header: {
    flexDirection: 'row',
  },
  timeSwitch: { marginLeft: 'auto' },
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
