import React, { Component } from 'react';
import {
  Alert,
  AsyncStorage,
  Image,
  View
} from 'react-native';

import Swiper from 'react-native-swiper';
import EStyleSheet from 'react-native-extended-stylesheet';

import ScheduleCard from './ScheduleCard.js';
import LoadingGIF from '../assets/images/loading.gif';

class Schedule extends Component {
  state = {
    schedule: null
  }

  async componentDidMount() {
    try {
      const schedule = await AsyncStorage.getItem('schedule');
      this.setState({
        schedule: JSON.parse(schedule)
      });
    } catch(error) {
      Alert.alert('Something went wrong getting your schedule.');
    }
  }

  render() {
    const {
      schedule
    } = this.state;
    const today = new Date().getDay();

    return (
      <View style={styles._scheduleContainer}>
        {
          schedule ?
            <Swiper
              horizontal
              index={today > 0 && today < 6 ? today - 1 : 0}
              dotStyle={styles._scheduleDotStyle}
              activeDotStyle={styles._scheduleDotStyle}
              containerStyle={styles._scheduleSwiperContainer}
            >
              {
                [...Array(5).keys()].map(key =>
                  <ScheduleCard
                    key={key}
                    schedule={schedule}
                    day={key + 1}
                  />
                )
              }
            </Swiper>
          :
            <Image
              source={LoadingGIF}
              style={styles._scheduleLoadingGIF}
            />
        }
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  scheduleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  scheduleLoadingGIF: {
    width: 40,
    height: 40
  },
  scheduleDotStyle: {
    marginBottom: '100% - 120px'
  }
});

export default Schedule;
