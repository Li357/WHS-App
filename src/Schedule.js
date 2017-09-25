import React, { Component } from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  Image,
  Platform,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import Carousel from 'react-native-looped-carousel';

import HamburgerMenu from './HamburgerMenu.js';
import ScheduleCard from './ScheduleCard.js';
import ScheduleTable from './ScheduleTable.js';
import LoadingGIF from '../assets/images/loading.gif';
import SCHEDULE from './util/schedule.js';

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
      Alert.alert('Error', 'Something went wrong getting your schedule.');
    }
  }

  render() {
    const { schedule } = this.state;
    const today = new Date().getDay();

    return (
      <View style={styles._scheduleContainer}>
        <HamburgerMenu navigation={this.props.navigation} />
        {
          schedule ?
            <Carousel
              style={styles._scheduleSwiperContainer}
              currentPage={today > 0 && today < 6 ? today - 1 : 0}
              autoplay={false}
              bullets
              bulletStyle={styles._scheduleDotStyle}
              chosenBulletStyle={styles._scheduleActiveDotStyle}
            >
              {
                [...Array(7).keys()].map(key =>
                  key < 5 ?
                    <ScheduleCard
                      key={key}
                      schedule={schedule}
                      day={key + 1}
                    />
                  :
                    <ScheduleTable
                      key={key}
                      schedule={SCHEDULE[key === 5 ? 'regular' : 'wednesday']}
                    />
                )
              }
            </Carousel>
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

const scheduleSwiperDotConfig = {
  margin: 4,
  ...Platform.select({
    ios: {
      top: -Dimensions.get('window').height + 120
    },
    android: {
      top: -10
    }
  }),
  borderWidth: 0,
  width: '$dashboardSwiperDotSize',
  height: '$dashboardSwiperDotSize'
}

const styles = EStyleSheet.create({
  $dashboardSwiperDotSize: 8,
  scheduleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  scheduleSwiperContainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  scheduleLoadingGIF: {
    width: 40,
    height: 40
  },
  scheduleDotStyle: {
    ...scheduleSwiperDotConfig,
    backgroundColor: 'rgba(0, 0, 0, 0.2)'
  },
  scheduleActiveDotStyle: {
    ...scheduleSwiperDotConfig,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  }
});

export default Schedule;
