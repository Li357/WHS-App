import React, { Component } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  Text,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import ScheduleItem from './ScheduleItem.js';
import selectSchedule from './util/schedule.js';
import { getCrossSectioned } from './util/crossSection.js';

/*
  TODO: use selectSchedule to determine schedule, on click of schedule card,
  fade in times, on click after, fade out times
*/

const days = [
  'M',
  'T',
  'W',
  'Th',
  'F'
];

const ScheduleCard = ({
  schedule,
  day,
  onLoad
}) => (
  <View style={styles._scheduleCardContainer}>
    <Text>
      {
        new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * (day - 1)).toLocaleString('en-us', {
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
);

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

export default ScheduleCard;
