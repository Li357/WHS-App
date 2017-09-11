import React, { Component } from 'react';
import {
  ScrollView,
  Text,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';

const ScheduleCard = ({ schedule, day }) => (
  <View style={styles._scheduleCardContainer}>
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
          console.log('Filled:', scheduleItem.day, filledMods, 'Item:', withOpenMods); //Cross sectioned mods conflict with this

          if(!filledMods.includes(scheduleItem.endMod)) {
            return [
              ...withOpenMods,
              scheduleItem,
              {
                title: 'OPEN MOD',
                length: (array[index + 1] ? array[index + 1].startMod : 15) - scheduleItem.endMod
              }
            ]
          }
          return [
            ...withOpenMods,
            scheduleItem
          ];
        }, []).map((scheduleItem, index) =>
          <View
            key={index}
            style={styles._scheduleCardWrappedContainer}
          >
            <View style={styles._scheduleCardWrappedTextContainer}>
              <Text style={styles._scheduleCardWrappedText}>{scheduleItem.title}</Text>
              <Text style={styles._scheduleCardWrappedText}>{scheduleItem.body}</Text>
            </View>
            {
              [...Array(scheduleItem.length).keys()].map(key =>
                <View
                  key={key}
                  style={styles._scheduleCardItemContainer}
                >
                  <Text style={styles._scheduleCardItemMod}>{scheduleItem.startMod === 0 ? 'HR' : scheduleItem.startMod + key}</Text>
                  <View
                    style={styles._scheduleCardItem}
                  />
                </View>
              )
            }
          </View>
        )
      }
    </ScrollView>
  </View>
);

const styles = EStyleSheet.create({
  $scheduleCardSize: '65%',
  scheduleCardContainer: {
    flex: 1,
    alignItems: 'center'
  },
  scheduleCardContentContainer: {
    alignItems: 'center'
  },
  scheduleCard: {
    width: '$scheduleCardSize',
    marginTop: 100,
    margin: 10
  },
  scheduleCardWrappedContainer: {
    width: '100%',
    borderColor: 'white',
    borderWidth: 1
  },
  scheduleCardWrappedTextContainer: {
    position: 'absolute',
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    left: 30,
    right: 0,
    bottom: 0
  },
  scheduleCardWrappedText: {
    fontFamily: 'BebasNeueBook',
    fontSize: 17,
  },
  scheduleCardItemContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  scheduleCardItemMod: {
    width: '13%',
    paddingTop: 29,
    paddingBottom: 29,
    paddingRight: 12,
    fontFamily: 'RobotoLight',
    textAlign: 'right'
  },
  scheduleCardItem: {
    width: '87%',
    height: 75,
    backgroundColor: 'lightgray'
  }
});

export default ScheduleCard;
