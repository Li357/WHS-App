import React, { Component } from 'react';
import {
  Alert,
  AppState,
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
import infoMap from './util/infoMap.js';
import LoadingGIF from '../assets/images/loading.gif';
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
      const [hours, minutes] = time.split(':');
      const lessThan20 = minutes < 20;
      const subtracted = `${+minutes + (lessThan20 && 60) - 20}`;
      return `${hours - lessThan20}:${subtracted.length < 2 ? '0' : ''}${subtracted}`;
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
    endTimeUntil: 0
  }

  async componentDidMount() {
    const { navigate } = this.props.navigation;

    try {
      const keys = [
        'username',
        'password',
        'name',
        'classOf',
        'homeroom',
        'counselor',
        'dean',
        'id',
        'schedule'
      ];

      for(const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if(value === null) {
          Alert.alert('Something went wrong with getting your login information.');
          navigate('Login');
          break;
        }
        this.setState({
          [key]: key === 'schedule' ? JSON.parse(value) : value
        });
      }
    } catch(error) {
      Alert.alert('Something went wrong with getting/saving your login information.');
    }

    const today = new Date().getDay();
    if(today < 6 || today !== 0) {
      this.runTimer();
      this.startEndDayCountdown();

      AppState.addEventListener('change', state => {
        if(state === 'active') {
          clearInterval(this.interval);
          this.runTimer();
        }
      });
    }
  }

  runTimer = () => {
    const now = new Date();
    const currentMod = this.getCurrentMod(now);
    const nextMod = this.getNextClass(now, currentMod);
    this.setState({
      timeUntil: this.calculateModCountdown(currentMod),
      currentMod,
      nextMod
    });
    this.startModCountdown();
  }

  calculateModCountdown = currentMod => {
    const now = new Date();
    const wednesday = now.getDay() === 3;
    const schedule = SCHEDULE[wednesday ? 'wednesday' : 'regular'];

    if(typeof currentMod === 'number' || currentMod === 'HR') {
      const endMod = new Date(now.getTime()).setHours(...schedule[+(currentMod !== 'HR') && currentMod - wednesday][1].split(':'), 0);

      return endMod - now;
    } else if(currentMod === 'PASSING PERIOD') {
      const nextMod = schedule.filter(([start], index) => {
        const startMod = new Date(now.getTime()).setHours(...start.split(':'), 0);

        if(index > 0) {
          const prevEndMod = new Date(now.getTime()).setHours(...schedule[index - 1][1].split(':'), 0);

          return now >= prevEndMod && now < startMod;
        }
      })[0][0].split(':');

      const nextModStart = new Date(now.getTime()).setHours(...nextMod, 0);

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
        future.setMinutes(future.getMinutes() + 1, 0);
        const nextMod = this.getCurrentMod(future);
        const nextModClass = this.getNextClass(future, nextMod);
        this.setState({
          timeUntil: this.calculateModCountdown(nextMod),
          currentMod: nextMod,
          nextMod: nextModClass
        });
        if(nextMod !== 'N/A') {
          this.startModCountdown();
        }
      }
    }, 1000);
  }

  startEndDayCountdown = () => {
    this.setState({
      endTimeUntil: this.getTimeUntilEnd()
    });
    this.endDayInterval = setInterval(() => {
      const { endTimeUntil } = this.state;

      if(endTimeUntil > 0) {
        this.setState(prevState => ({
          endTimeUntil: prevState.endTimeUntil - 1000
        }));
      } else {
        clearInterval(this.endDayInterval);
      }
    }, 1000);
  }

  getCurrentMod = now => {
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const nowDay = now.getDay();
    const wednesday = nowDay === 3;
    const schedule = SCHEDULE[wednesday ? 'wednesday' : 'regular'];

    if(nowDay > 5 || now - new Date().setHours(...schedule.slice(-1)[0][1].split(':')) >= 0) {
      return 'N/A';
    }

    const currentMod = schedule.reduce((current, timePair, index) => {
      const [start, end] = timePair.map(time => time.split(':'));
      return now - new Date(now.getTime()).setHours(...start) >= 0 && now - new Date().setHours(...end) < 0 ?
               wednesday ? index + 1 : index : current;
    }, -1);

    return currentMod === -1 ? 'PASSING PERIOD' :
             currentMod === 0 ? 'HR' : currentMod;
  }

  getNextClass = (now, currentMod) => {
    const { schedule } = this.state;
    const future = new Date(now.getTime());
    future.setMinutes(future.getMinutes() + 5);
    const nextMod = currentMod === 'HR' ? 1 :
                      currentMod === 'PASSING PERIOD' ? this.getCurrentMod(future) :
                        currentMod + 1 <= 14 ? currentMod + 1 : 'N/A';

    return nextMod !== 'N/A' ?
      schedule.schedule.filter(mod => {
        const mods = [...Array(mod.length).keys()].map(key =>
          key + mod.startMod
        );

        return mod.day === now.getDay() && mods.includes(nextMod);
      })[0] || {
        title: 'Open Mod',
        body: ''
      }
    :
      {
        title: 'N/A',
        body: ''
      }
  }

  getTimeUntilEnd = () => {
    const now = new Date();
    const schedule = SCHEDULE[now.getDay() === 3 ? 'wednesday' : 'regular'];
    return new Date().setHours(...schedule.slice(-1)[0][1].split(':')) - now;
  }

  formatTime = milliseconds => {
    const padNumber = num => (`${num}`.length < 2 ? '0' : '') + num;
    const getRemaining = num => (num - Math.floor(num)) * 60

    const hours = milliseconds / (1000 * 60 * 60);
    const minutes = getRemaining(hours);
    const seconds = Math.floor(getRemaining(minutes));
    const hoursExist = Math.floor(hours) > 0;
    return `${hoursExist ? `${Math.floor(hours)}:` : ''}${hoursExist ? padNumber(Math.floor(minutes)) : Math.floor(minutes)}:${padNumber(seconds)}`;
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.endDayInterval);
    AppState.removeEventListener('change');
  }

  render() {
    const {
      timeUntil,
      endTimeUntil,
      currentMod,
      nextMod,
      name,
      classOf,
      homeroom,
      counselor,
      dean,
      id
    } = this.state;
    const formattedTimeUntil = this.formatTime(timeUntil);
    const formattedEndTimeUntil = this.formatTime(endTimeUntil);
    const today = new Date().getDay();

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
            <View style={styles._dashboardUserInfo}>
              <View>
                {
                  homeroom && counselor && dean &&
                    [
                      homeroom,
                      counselor,
                      dean
                    ].map((mentor, index) =>
                      <View
                        key={index}
                        style={styles._dashboardUserInfoCardTextContainer}
                      >
                        <Text style={styles._dashboardUserInfoCardTextType}>{`${mentor.split('  ')[0]} `}</Text>
                        <Text style={styles._dashboardUserInfoCardText}>{`${mentor.split('  ')[1]}`}</Text>
                      </View>
                    )
                }
                {
                  id &&
                    <View style={styles._dashboardUserInfoCardTextContainer}>
                      <Text style={styles._dashboardUserInfoCardTextType}>Student ID: </Text>
                      <Text style={styles._dashboardUserInfoCardText}>{id}</Text>
                    </View>
                }
              </View>
            </View>
          </Swiper>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles._dashboardInfoContainer}
          style={styles._dashboardInfo}
        >
          {
            currentMod ?
              (
                typeof currentMod === 'number' || currentMod === 'HR' && nextMod ?
                  <InMod
                    currentMod={currentMod}
                    untilModIsOver={formattedTimeUntil}
                    nextMod={nextMod.title}
                    nextModInfo={nextMod.body}
                  />
                :
                  currentMod === 'PASSING PERIOD' && nextMod ?
                    <PassingPeriod
                      untilPassingPeriodIsOver={formattedTimeUntil}
                      nextMod={nextMod.title}
                      nextModInfo={nextMod.body}
                    />
                  :
                    <Text style={styles._dashboardInfoText}>
                      {
                        today > 4 || today === 0 ?
                          'Enjoy your weekend!'
                        :
                          'You\'re done for the day!'
                      }
                    </Text>
              )
            :
              <Image
                source={LoadingGIF}
                style={styles._dashboardInfoLoadingGIF}
              />
          }
          {
            currentMod && (today < 6 && today !== 0) &&
              [
                {
                  value: formattedEndTimeUntil,
                  title: today === 5 ? 'UNTIL WEEKEND' : 'UNTIL DAY IS OVER'
                }
              ].map(infoMap)
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
  $dashboardInfoLoadingGIFSize: 40,
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
  dashboardUserInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '$dashboardSwiperContainerSize'
  },
  dashboardUserInfoCardTextContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  dashboardUserInfoCardTextType: {
    fontFamily: 'RobotoRegular',
    paddingRight: 0,
    padding: 5,
  },
  dashboardUserInfoCardText: {
    fontFamily: 'RobotoLight',
    paddingLeft: 0,
    padding: 5
  },
  dashboardInfoContainer: {
    alignItems: 'center'
  },
  dashboardInfo: {
    width: '100%',
    backgroundColor: 'white',
    paddingRight: 20,
    paddingLeft: 20,
  },
  dashboardInfoLoadingGIF: {
    width: '$dashboardInfoLoadingGIFSize',
    height: '$dashboardInfoLoadingGIFSize',
    backgroundColor: 'white',
    marginTop: 150
  },
  dashboardInfoText: {
    fontFamily: 'BebasNeueBook',
    fontSize: 65,
    marginTop: 30,
    textAlign: 'center'
  }
});

export default Dashboard;
