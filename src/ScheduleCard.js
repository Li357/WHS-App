import React, { Component } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

import ScheduleItem from './ScheduleItem.js';

/*let getCrossSectioned = ({ schedule }, day) => schedule.filter((scheduleItem, index, array) =>
  scheduleItem.day === day && index !== array.findIndex(anotherItem =>
    anotherItem.day === scheduleItem.day && anotherItem.startMod === scheduleItem.startMod
  )
);*/

const days = [
  'M',
  'T',
  'W',
  'Th',
  'F'
]

const ScheduleCard = ({ schedule, day }) => (
  <View style={styles._scheduleCardContainer}>
    <Text style={styles._scheduleCardDay}>{days[day - 1]}</Text>
    {/*
      day === new Date().getDay() &&
        <View style={styles._schedulePointer}>
          <View style={styles._schedulePointerCircle} />
          <View style={styles._schedulePointerLine} />
        </View>
    */}
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles._scheduleCardContentContainer}
      style={styles._scheduleCard}
    >
      {
        schedule.schedule.filter(scheduleItem =>
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
              ...[
                ...Array(scheduleItem.length).keys()
              ].map(key =>
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
        }, []).map((scheduleItem, index) => //IF CROSS SECTIONED ADD WARNING LABEL & ALERT.
          <ScheduleItem
            key={index}
            scheduleItem={scheduleItem}
          />
        )
      }
    </ScrollView>
  </View>
);

const styles = EStyleSheet.create({
  $scheduleCardSize: '65%',
  $schedulePointerCircleSize: 12,
  $schedulePointerLineSize: 2,
  scheduleCardContainer: {
    flex: 1,
    alignItems: 'center'
  },
  scheduleCardDay: {
    fontFamily: 'Roboto-Regular',
    fontSize: 30,
    marginTop: 30
  },
  schedulePointer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row',
    position: 'absolute',
    top: 200,
    left: 40,
    zIndex: 2,
  },
  schedulePointerCircle: {
    width: '$schedulePointerCircleSize',
    height: '$schedulePointerCircleSize',
    borderRadius: '$schedulePointerCircleSize / 2',
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  schedulePointerLine: {
    width: 275,
    height: '$schedulePointerLineSize',
    marginTop: 5,
    marginBottom: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.8)'
  },
  scheduleCardContentContainer: {
    alignItems: 'center'
  },
  scheduleCard: {
    width: '$scheduleCardSize',
    marginTop: 60,
    margin: 10
  }
});

export default ScheduleCard;
