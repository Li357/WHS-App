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
    ['12:55', '13:10'],
    ['13:15', '13:50'],
    ['13:55', '14:30'],
    ['14:35', '15:10']
  ];

  const wednesday = regular.slice(1).map(timePair =>
    timePair.map(time => {
      const split = time.split(':');
      const lessThan20 = split[1] < 20;
      const subtracted = +split[1] + (lessThan20 && 60) - 20 + '';
      return `${split[0] - lessThan20}:${subtracted.length < 2 ? '0' : ''}${subtracted}`;
    })
  );

  return {
    regular,
    wednesday
  }
})();

class Dashboard extends Component {
  state = {
    timeUntil: 0,
    username: '',
    password: '',
    name: '',
    classOf: '',
    schedule: null
  }

  async componentDidMount() {
    try {
      const username = await AsyncStorage.getItem('username');
      const password = await AsyncStorage.getItem('password');
      const storedName = await AsyncStorage.getItem('name');
      const storedClassOf = await AsyncStorage.getItem('classOf');
      const storedSchedule = await AsyncStorage.getItem('schedule');

      const params = this.props.navigation.state.params;
      if(params) {
        const {
          name,
          classOf,
          scheduleJSON
        } = params;

        await AsyncStorage.setItem('username', username);
        await AsyncStorage.setItem('password', password);
        await AsyncStorage.setItem('name', name);
        await AsyncStorage.setItem('classOf', classOf);
        await AsyncStorage.setItem('schedule', scheduleJSON);
      }

      this.setState({
        username,
        password,
        name: storedName,
        classOf: storedClassOf,
        schedule: storedSchedule
      });
    } catch(error) {
      Alert.alert('Something went wrong with getting/saving your login information.');
    }

    const currentMod = this.getCurrentMod(new Date());
    this.setState({
      timeUntil: this.calculateModCountdown(currentMod),
      currentMod
    });
    this.startModCountdown();
  }

  calculateModCountdown = (currentMod) => {
    const now = new Date();
    const wednesday = now.getDay() === 3;
    const schedule = SCHEDULE[wednesday ? 'wednesday' : 'regular'];

    if(typeof currentMod === 'number' || currentMod === 'HR') {
      const endMod = new Date(now.getTime());
      endMod.setHours(...schedule[currentMod !== 'HR' && currentMod - wednesday][1].split(':'));

      return endMod - now;
    } else if(currentMod === 'PASSING PERIOD') {
      const nextMod = schedule.filter((timePair, index) => {
        const startMod = new Date(now.getTime());
        startMod.setHours(...timePair[0].split(':'));

        if(index > 0) {
          const prevEndMod = new Date(now.getTime());
          prevEndMod.setHours(...schedule[index - 1][1].split(':'));

          return prevEndMod <= now < startMod;
        }
      })[0][0].split(':');

      const nextModStart = new Date(now.getTime());
      nextModStart.setHours(...nextMod);

      return nextModStart - now;
    }
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
        const future = new Date();
        const nextMod = this.getCurrentMod(future);
        this.setState({
          timeUntil: this.calculateModCountdown(nextMod, false),
          currentMod: nextMod
        });
        this.startModCountdown();
      }
    }, 1000);
  }

  getCurrentMod = (now) => {
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const wednesday = now.getDay() === 3;
    const schedule = SCHEDULE[wednesday ? 'wednesday' : 'regular'];

    const lastMod = schedule.slice(-1)[0][1].split(':');
    if(nowHours > lastMod[0] || nowHours === lastMod[0] && nowMinutes > lastMod[1]) {
      return 'N/A';
    }

    const currentMod = schedule.reduce((current, timePair, index) => {
      const splitTimes = timePair.map(time => time.split(':'));
      return nowHours >= splitTimes[0][0] && nowMinutes >= splitTimes[0][1] &&
             nowHours <= splitTimes[1][0] && nowMinutes < splitTimes[1][1] ?
               wednesday ? index + 1 : index : current;
    }, -1);

    return currentMod === -1 ? 'PASSING PERIOD' :
             currentMod === 0 ? 'HR' : currentMod;
  }

  getNextClass = () => {

  }

  handleLogout = async () => {
    try {
      AsyncStorage.multiRemove([
        'username',
        'password',
        'name',
        'classOf',
        'schedule'
      ], (error) => {
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
    const {
      timeUntil,
      currentMod,
      name,
      classOf,
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

const dashboardSwiperDotConfig = {
  width: '$dashboardSwiperDotSize',
  height: '$dashboardSwiperDotSize',
  borderRadius: '$dashboardSwiperDotSize / 2',
  margin: 3,
  marginBottom: -15
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
    ...dashboardSwiperDotConfig,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dashboardSwiperActiveDot: {
    ...dashboardSwiperDotConfig,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  dashboardUserContainer: {
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
    fontSize: 25
  },
  dashboardUserClassOf: {
    fontFamily: 'RobotoLight',
    fontSize: 15,
    margin: 5,
    marginBottom: 10
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
    width: '100%',
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
