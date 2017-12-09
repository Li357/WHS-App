import React, { Component } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  Text,
  View
} from 'react-native';

import { connect } from 'react-redux';

import EStyleSheet from 'react-native-extended-stylesheet';

import ScheduleItem from './ScheduleItem.js';
import selectSchedule from './util/schedule.js';
import { getCrossSectioned } from './util/crossSection.js';

const days = [
  'M',
  'T',
  'W',
  'Th',
  'F'
];

class ScheduleCard extends Component {
  state = {
    isTimes: false,
    opacity: 1
  }

  toggleTimes = () => {
    const { isTimes } = this.state;

    Animated.timing(
      this.state.opacity,
      {
        toValue: 0,
        duration: 500
      }
    ).start(() => {
      this.setState(({ isTimes }) => ({
        isTimes: !isTimes
      }), () => {
        Animated.timing(
          this.state.opacity,
          {
            toValue: 1,
            duration: 500
          }
        ).start();
      });
    })
  }

  formatTableTimes = timePair => {
    return timePair.map(time => {
      const splitTime = time.split(':');
      return `${+splitTime[0] !== 12 ? +splitTime[0] % 12 : 12}:${splitTime[1]}`;
    }).join(' - ');
  }

  render() {
    const {
      schedule: daySchedule,
      day,
      onLoad,
      dates
    } = this.props;

    const dayOfWeek = new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * (day - 1));

    const { isTimes } = this.state;

    const {
      schedule: timeTable,
      string
    } = selectSchedule(dates, dayOfWeek);
    const schedule = isTimes ? daySchedule : timeTable.map((timePair, index) => ({
      title: this.formatTableTimes(timePair),
      length: 1,
      startMod: index + (['wednesday', 'lateStartWednesday'].includes(string))
    }));

    return (
      <TouchableWithoutFeedback onPress={this.toggleTimes}>
        <View style={styles._scheduleCardContainer}>
          <Text>
            {
              dayOfWeek.toLocaleString('en-us', {
                day: 'numeric',
                month: 'short'
              })
            }
          </Text>
          <Text style={styles._scheduleCardDay}>{days[day - 1]}</Text>
          {
            schedule.length > 1 ?
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles._scheduleCardContentContainer}
                style={styles._scheduleCard}
              >
                {
                  schedule.filter(scheduleItem =>
                    scheduleItem.day === day
                  ).sort((a, b) =>
                    a.startMod - b.startMod
                  ).filter((scheduleItem, index, array) =>
                    index === array.findIndex(anotherItem =>
                      anotherItem.day === scheduleItem.day && anotherItem.startMod === scheduleItem.startMod
                    )
                  ).reduce((withOpenMods, scheduleItem, index, array) => {
                    const filledMods = array.reduce((filled, scheduleItem) =>
                      [
                        ...filled,
                        ...Array.from(new Array(scheduleItem.length), (_, i) => i).map(key =>
                          key + scheduleItem.startMod
                        )
                      ]
                    , []);

                    if(!filledMods.includes(scheduleItem.endMod) && scheduleItem.endMod !== 15) {
                      return [
                        ...withOpenMods,
                        scheduleItem,
                        {
                          title: 'OPEN MOD',
                          length: (array[index + 1] ? array[index + 1].startMod : 15) - scheduleItem.endMod,
                          startMod: scheduleItem.endMod
                        }
                      ]
                    }
                    return [
                      ...withOpenMods,
                      scheduleItem
                    ];
                  }, [])
                  ).map((scheduleItem, index) =>
                    <ScheduleItem
                      key={index}
                      scheduleItem={scheduleItem}
                      crossSectionedMods={getCrossSectioned(schedule, day)}
                    />
                  )
                }
              </ScrollView>
            :
              <Text>No schedule available</Text>
          }
          {
            Platform.OS === 'android' &&
              <View style={{
                height: 10
              }} />
          }
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = EStyleSheet.create({
  $scheduleCardSize: '65%',
  $schedulePointerCircleSize: 12,
  $schedulePointerLineSize: 2,
  scheduleCardContainer: {
    flex: 1,
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  scheduleCardDay: {
    fontFamily: 'Roboto-Regular',
    ...(Platform.OS === 'ios' ? {
      fontSize: 30,
      marginTop: 30
    } : {
      fontSize: 50,
      marginTop: 50
    })
  },
  scheduleCardContentContainer: {
    alignItems: 'center'
  },
  scheduleCard: {
    width: '$scheduleCardSize',
    ...(Platform.OS === 'ios' ? {
      marginTop: 60
    } : {
      marginTop: 40
    }),
    margin: 10
  }
});

const mapStateToProps = ({ dates }) => ({
  dates
});

export default connect(mapStateToProps)(ScheduleCard);
