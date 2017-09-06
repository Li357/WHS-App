import React, { Component } from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import Swiper from 'react-native-swiper';
import EStyleSheet from 'react-native-extended-stylesheet';

import InMod from './InMod.js';
import PassingPeriod from './PassingPeriod.js';
import BlankUser from '../assets/images/blank-user.png';

const SCHEDULE = (() => {
  const regular = [
    ['8:00', '8:15'],
    ['8:20', '9:00'],
    ['9:05', '9:40'],
    ['9:45', '10:20'],
    ['10:25', '10:40'],
    ['10:45', '11:00'],
    ['11:05', '11:22'],
    ['11:27', '11:44'],
    ['11:49', '12:06'],
    ['12:11', '12:28'],
    ['12:33', '12:50'],
    ['12:55', '1:10'],
    ['1:15', '1:50'],
    ['1:55', '2:30'],
    ['2:35', '3:10']
  ];

  const wednesday = regular.slice(1).map(timePair => //TODO: Rewrite this whole thing (too complex)
    timePair.map(time => {
      const split = time.split(':');
      let hour = +split[0];
      let minutes = +split[1];
      if(minutes < 20) {
        if(hour === 1) {
          hour = 12;
        } else {
          hour -= 1;
        }
        minutes += 60;
      }
      const subtractedMinutes = minutes - 20 + '';
      return `${hour}:${subtractedMinutes.length < 2 ? '0' : ''}${subtractedMinutes}`;
    })
  );

  return {
    regular,
    wednesday
  }
})();

class Dashboard extends Component {
  state = {
    timeUntil: 0
  }

  componentDidMount() {
    /*try {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');
      this.setState({
        username,
        password
      });
    } catch(error) {
      Alert.alert('Something went wrong with getting your login information.');
    }*/
    const currentMod = this.getCurrentMod(); //TODO: Rewrite this crap
    let timeUntil = 0;
    const now = new Date(2017, 8, 5, 9, 34);
    const nowDay = now.getDay();
    const schedule = SCHEDULE[nowDay === 3 ? 'wednesday' : 'regular'];

    if(typeof currentMod === 'number' || currentMod === 'HR') {
      const mod = schedule[currentMod !== 'HR' && currentMod - (nowDay === 3)][1].split(':').map(part => +part - 1); //Minutes and seconds are 0 based?!
      console.log(mod);

      const endMod = new Date(now.getTime());
      console.log(endMod);
      endMod.setHours(...mod);

      console.log(endMod);

      timeUntil = endMod - now;
    } else if(currentMod === 'PASSING PERIOD') {
      const nextMod = schedule.filter((timePair, index) => {
        const startTime = timePair[0].split(':').map(part => +part - 1);
        const prevModEndTime = schedule[index > 0 && index - 1][1].split(':').map(part => +part - 1);

        const startMod = new Date(now.getTime());
        startMod.setHours(...startTime);

        const prevEndMod = new Date(now.getTime());
        prevEndMod.setHours(...prevModEndTime);

        return now < startMod && now < prevEndMod;
      })[0][0].split(':').map(part => +part - 1);

      const nextModStart = new Date(now.getTime());
      nextModStart.setHours(...nextMod);

      timeUntil = nextModStart - now;
    }
    this.setState({
      timeUntil
    });
    this.startModCountdown();
  }

  startModCountdown = () => {
    this.interval = setInterval(() => {
      const { timeUntil } = this.state;
      if(timeUntil > 0) {
        this.setState(prevState => ({
          timeUntil: prevState.timeUntil - 1000
        }));
      } else {
        clearInterval(this.interval);
        //move to diff screen
      }
    }, 1000);
  }

  normalizeHours = (hours) => hours < 8 ? hours + 12 : hours

  getCurrentMod = () => { //TODO: Complete rewrite (this code sucks)
    const now = new Date();
    const nowHours = 10//now.getHours() + 1;
    const nowMinutes = 35//now.getMinutes() + 1;
    const nowDay = now.getDay();
    const schedule = SCHEDULE[nowDay === 3 ? 'wednesday' : 'regular'];

    const last = schedule.slice(-1)[0][1].split(':');
    let lastHours = this.normalizeHours(+last[0]);
    const lastMinutes = last[1];

    if(nowHours > lastHours || nowHours < 8 || nowHours === lastHours && nowMinutes > lastMinutes) {
      return 'N/A';
    }

    const currentMod = schedule.reduce((currentMod, timePair, index) => {
      const revisedTimes = timePair.map(time => {
        const splitTime = time.split(':');
        let hours = splitTime[0];
        const minutes = splitTime[1];
        if(hours < 8) {
          hours += 12;
        }
        return {
          hours,
          minutes
        }
      });
      return nowHours >= revisedTimes[0].hours && nowMinutes >= revisedTimes[0].minutes &&
             nowHours <= revisedTimes[1].hours && nowMinutes <= revisedTimes[1].minutes ?
               nowDay === 3 ? index + 1 : index : currentMod;
    }, -1);

    if(currentMod === -1) {
      return 'PASSING PERIOD';
    } else if(currentMod === 0) {
      return 'HR';
    }
    return currentMod;
  }

  handleLogout = async () => {
    try {
      AsyncStorage.multiRemove(['username', 'password'], (error) => {
        if(error) {
          throw error;
        }
        this.props.navigation.navigate('Login');
      });
    } catch(error) {
      Alert.alert('Something went wrong logging out.');
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    /*const {
      Name,
      ClassOf,
      Schedule
    } = this.props.navigation.state.params;*/

    const name = 'Andrew Li';
    const classOf = 'Class of 2021';
    const currentMod = this.getCurrentMod();

    const {
      timeUntil
    } = this.state;

    const minutesUntil = timeUntil / (1000 * 60);
    const secondsUntil = Math.floor((minutesUntil - Math.floor(minutesUntil)) * 60) + '';
    const formattedTimeUntil = `${Math.floor(minutesUntil)}:${secondsUntil.length < 2 ? '0' : ''}${secondsUntil}`;

    return (
      <View style={styles._dashboardContainer}>
        <View style={styles._dashboardSwiperContainer}>
          <Swiper
            horizontal
            dot={<View style={styles._dashboardSwiperDot} />}
            activeDot={<View style={styles._dashboardSwiperActiveDot} />}
            containerStyle={styles._dashboardUserContainer}
          >
            <View style={styles._dashboardUserProfile}>
              <Image
                source={BlankUser}
                style={styles._dashboardUserImage}
              />
              <Text
                style={styles._dashboardUserName}
              >
                {name}
              </Text>
              <Text
                style={styles._dashboardUserClassOf}
              >
                {classOf}
              </Text>
            </View>
            <View style={styles._dashboardUserSettings}>
              <TouchableOpacity
                style={styles._dashboardUserSettingsButton}
              >
                <Text style={styles._dashboardUserSettingsText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.handleLogout}
                style={styles._dashboardUserSettingsButton}
              >
                <Text style={styles._dashboardUserSettingsText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Swiper>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles._dashboardInfo}
        >
          {
            typeof currentMod === 'number' || currentMod === 'HR' ?
              <InMod
                currentMod={currentMod}
                untilModIsOver={formattedTimeUntil}
                nextMod={'Personal Finance'}
              />
            :
              currentMod === 'PASSING PERIOD' ?
                <PassingPeriod
                  untilPassingPeriodIsOver={formattedTimeUntil}
                  nextClass={'Personal Finance'}
                />
              :
                <Text style={styles._dashboardInfoText}>You're done for the day!</Text>
          }
        </ScrollView>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  $dashboardSwiperContainerSize: 230,
  $dashboardSwiperDotSize: 8,
  $dashboardUserImageSize: 110,
  dashboardContainer: {
    flex: 1,
    alignItems: 'center'
  },
  dashboardSwiperContainer: {
    height: '$dashboardSwiperContainerSize'
  },
  dashboardSwiperDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    width: '$dashboardSwiperDotSize',
    height: '$dashboardSwiperDotSize',
    borderRadius: '$dashboardSwiperDotSize / 2',
    margin: 3,
    marginBottom: -15
  },
  dashboardSwiperActiveDot: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    width: '$dashboardSwiperDotSize',
    height: '$dashboardSwiperDotSize',
    borderRadius: '$dashboardSwiperDotSize / 2',
    margin: 3,
    marginBottom: -15
  },
  dashboardUserContainer: {
    width: Dimensions.get('window').width,
    backgroundColor: 'lightgray'
  },
  dashboardUserProfile: {
    alignItems: 'center'
  },
  dashboardUserImage: {
    width: '$dashboardUserImageSize',
    height: '$dashboardUserImageSize',
    borderRadius: '$dashboardUserImageSize / 2',
    marginTop: 30,
    marginBottom: 5
  },
  dashboardUserName: {
    fontFamily: 'RobotoLight',
    fontSize: 25,
    textAlign: 'center'
  },
  dashboardUserClassOf: {
    fontFamily: 'RobotoLight',
    fontSize: 15,
    margin: 5,
    marginBottom: 10,
    textAlign: 'center'
  },
  dashboardUserSettings: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$dashboardSwiperContainerSize'
  },
  dashboardUserSettingsButton: {
    padding: 10,
    margin: 5,
    width: '80%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)'
  },
  dashboardUserSettingsText: {
    fontFamily: 'RobotoLight',
    fontSize: 17,
    textAlign: 'center'
  },
  dashboardInfo: {
    width: Dimensions.get('window').width,
    backgroundColor: 'white'
  },
  dashboardInfoText: {
    fontFamily: 'BebasNeueBook',
    fontSize: 65,
    marginTop: 30,
    textAlign: 'center'
  }
});

export default Dashboard;
