import React, { Component } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { connect } from 'react-redux';

import EStyleSheet from 'react-native-extended-stylesheet';

import ScheduleItem from './ScheduleItem.js';
import selectSchedule from './util/schedule.js';
import {
  getOverlappingMods,
  getTodayCrossSectioned,
  getCurrentCrossSectioned
} from './util/crossSection.js';

const days = [
  'M',
  'T',
  'W',
  'Th',
  'F'
];

class ScheduleCard extends Component {
  state = {
    opacity: new Animated.Value(1)
  }

  formatTableTimes = timePair => {
    return timePair.map(time => {
      const splitTime = time.split(':');
      return `${+splitTime[0] !== 12 ? +splitTime[0] % 12 : 12}:${splitTime[1]}`;
    }).join(' - ');
  }

  onToggleTimes = () => {
    const {
      day,
      onToggleTimes
    } = this.props;

    Animated.timing(
      this.state.opacity,
      {
        toValue: 0,
        duration: 500
      }
    ).start(async () => {
      await onToggleTimes(day);
      Animated.timing(
        this.state.opacity,
        {
          toValue: 1,
          duration: 500
        }
      ).start();
    });
  }

  getThisMonday = date => {
    const day = date.getDay() || 7;
    return new Date(day === 1 ? date.getTime() : date.setHours(-24 * (day - 1)));
  }

  keyMap = (key, crossSectioned) => crossSectioned.map(item => item[key]);

  render() {
    const {
      schedule: daySchedule,
      day,
      onLoad,
      dates,
      isTimes,
      finalsSchedule,
      dean,
      counselor,
      homeroom
    } = this.props;

    const dayOfWeek = new Date(this.getThisMonday(new Date()).getTime() + 1000 * 60 * 60 * 24 * (day - 1));

    const { opacity } = this.state;
    const isTeacher = [dean, counselor, homeroom].every(el => el === null);
    const {
      schedule: timeTable,
      string,
      isFinals,
      isBreak
    } = selectSchedule(dates, dayOfWeek, isTeacher);
    const startModNumber = isFinals && day === 5 ? 4 : 0;

    const schedule = !isTimes ?
      isFinals ?
        [
          daySchedule.find(({ sourceType }) => sourceType === 'homeroom') || {
            startMod: 0,
            title: 'Homeroom'
          },
          ...timeTable.slice(1).map((_, index, array) => ({
            title: index === array.length - 1 && isTeacher ? 'Lunch & Grading' : 'Finals',
            length: 1,
            startMod: index + 1
          }))
        ]
      :
        daySchedule
    :
      timeTable.map((timePair, index) => ({
        title: this.formatTableTimes(timePair),
        length: 1,
        startMod: index + (['wednesday', 'lateStartWednesday'].includes(string))
      }));

    const todayCrossSectioned = getTodayCrossSectioned(schedule, day);

    return (
      <View style={styles._scheduleCardContainer}>
        <Text style={styles._scheduleCardDay}>
          {
            !isBreak &&
              dayOfWeek.toLocaleString('en-us', {
                day: 'numeric',
                month: 'short'
              }) + ' - '
          }
          {days[day - 1]}
        </Text>
        <TouchableOpacity
          onPress={this.onToggleTimes}
          style={styles._toggleTimesContainer}
        >
          <Text style={styles._toggleTimes}>Toggle Times</Text>
        </TouchableOpacity>
        {
          schedule.length > 0 ?
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles._scheduleCardContentContainer}
              style={styles._scheduleCard}
            >
              {
                (
                  !isTimes && !isFinals ?
                    schedule.filter(scheduleItem =>
                      scheduleItem.day === day
                    ).sort((a, b) =>
                      a.startMod - b.startMod
                    ).filter(({ startMod, endMod }, index, array) =>
                      index === array.findIndex(anotherItem =>
                        anotherItem.startMod === startMod && anotherItem.endMod === endMod
                      )
                    ).reduce((withOpenMods, scheduleItem, index, array) => {
                      const filledMods = array.reduce((filled, scheduleItem) =>
                        [
                          ...filled,
                          ...Array.from(new Array(scheduleItem.length), (_, i) => i).map(key =>
                            key + scheduleItem.startMod
                          )
                        ],
                        []
                      );

                      const currentCross = getCurrentCrossSectioned(scheduleItem, todayCrossSectioned);
                      const irregular = currentCross.some((item, index, array) =>
                        (array[index + 1] || item).startMod !== item.startMod || (array[index + 1] || item).endMod !== item.endMod
                      );

                      if(irregular) {
                        const withItem = [scheduleItem, ...currentCross]
                        const leastStart = Math.min(...this.keyMap('startMod', withItem));
                        const greatestEnd = Math.max(...this.keyMap('endMod', withItem));

                        return [
                          ...withOpenMods,
                          {
                            ...scheduleItem,
                            startMod: leastStart,
                            length: greatestEnd - leastStart,
                            endMod: greatestEnd,
                            unmodified: scheduleItem,
                            irregular: true
                          }
                        ];
                      } else if(!filledMods.includes(scheduleItem.endMod) && scheduleItem.endMod !== 15) {
                        return [
                          ...withOpenMods,
                          scheduleItem,
                          {
                            title: 'OPEN MOD',
                            length: (array[index + 1] ? array[index + 1].startMod : 15) - scheduleItem.endMod,
                            startMod: scheduleItem.endMod
                          }
                        ];
                      }
                      return [
                        ...withOpenMods,
                        scheduleItem
                      ];
                    }, [])
                  :
                    schedule
                ).filter((item, index, array) => {
                  const currentCross = getCurrentCrossSectioned(item, todayCrossSectioned);
                  const leastStart = Math.min(...this.keyMap('startMod', currentCross));
                  const greatestEnd = Math.max(...this.keyMap('endMod', currentCross));

                  return !item.irregular || item.irregular && index === array.findIndex(anotherItem => anotherItem.irregular);
                }).map((scheduleItem, index, array) =>
                  <ScheduleItem
                    key={index}
                    scheduleItem={scheduleItem}
                    crossSectionedMods={todayCrossSectioned}
                    textStyle={opacity}
                    startModNumber={startModNumber}
                    isFinals={isFinals}
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
    )
  }
}

const styles = EStyleSheet.create({
  $scheduleCardSize: '70%',
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
      marginTop: 20
    } : {
      marginTop: 0
    }),
    margin: 10
  },
  toggleTimesContainer: {
    backgroundColor: 'lightgray',
    marginTop: 35,
    marginBottom: 10,
    padding: 7
  },
  toggleTimes: {
    color: 'black',
    fontFamily: 'Roboto-Light',
  }
});

const mapStateToProps = ({
  dates,
  dean,
  counselor,
  homeroom
}) => ({
  dates,
  dean,
  counselor,
  homeroom
});

export default connect(mapStateToProps)(ScheduleCard);
