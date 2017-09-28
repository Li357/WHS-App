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
  View,
  findNodeHandle
} from 'react-native';

import { connect } from 'react-redux';

import EStyleSheet from 'react-native-extended-stylesheet';
import Carousel from 'react-native-looped-carousel';
import PhotoUpload from 'react-native-photo-upload';
import { BlurView } from 'react-native-blur';

import HamburgerMenu from './HamburgerMenu.js';
import InMod from './InMod.js';
import PassingPeriod from './PassingPeriod.js';
import SCHEDULE from './util/schedule.js';
import infoMap from './util/infoMap.js';
import LoadingGIF from '../assets/images/loading.gif';
import BlankUser from '../assets/images/blank-user.png';

class Dashboard extends Component {
  state = {
    timeUntil: 0,
    endTimeUntil: 0,
    loadingProfileImage: true,
    bgRef: null
  }

  componentDidMount() {
    const now = new Date();
    const today = now.getDay();
    if(today < 6 || today !== 0) {
      if(this.getCurrentMod(now) === 'BEFORE') {
        this.startBeginDayCountdown();
      } else {
        this.runTimer();
        this.startEndDayCountdown();
      }

      AppState.addEventListener('change', state => {
        clearInterval(this.interval);
        clearInterval(this.beginDayInterval);
        clearInterval(this.endDayInterval);
        if(state === 'active') {
          if(this.getCurrentMod(new Date()) === 'BEFORE') {
            this.startBeginDayCountdown();
          } else {
            this.runTimer();
            this.startEndDayCountdown();
          }
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

  startBeginDayCountdown = () => {
    this.setState({
      beginTimeUntil: this.getTimeUntilBegin(),
      currentMod: 'BEFORE'
    });
    this.beginDayInterval = setInterval(() => {
      const { beginTimeUntil } = this.state;

      if(beginTimeUntil > 0) {
        this.setState(prevState => ({
          beginTimeUntil: prevState.beginTimeUntil - 1000
        }));
      } else {
        clearInterval(this.beginDayInterval);
        this.runTimer();
        this.startEndDayCountdown();
      }
    }, 1000);
  }

  getCurrentMod = now => {
    const nowHours = now.getHours();
    const nowMinutes = now.getMinutes();
    const nowDay = now.getDay();
    const wednesday = nowDay === 3;
    const schedule = SCHEDULE[wednesday ? 'wednesday' : 'regular'];

    const afterEnd = new Date().setHours(...schedule.slice(-1)[0][1].split(':'), 0);
    const first = new Date().setHours(...schedule[0][0].split(':'), 0);
    if(nowDay > 5 || nowDay === 0 || now - afterEnd >= 0) {
      return 'N/A';
    }

    if(now < first) {
      return 'BEFORE';
    }

    const currentMod = schedule.reduce((current, timePair, index) => {
      const [start, end] = timePair.map(time => time.split(':'));
      return now - new Date(now.getTime()).setHours(...start, 0) >= 0 && now - new Date().setHours(...end, 0) < 0 ?
               wednesday ? index + 1 : index : current;
    }, -1);

    return currentMod === -1 ? 'PASSING PERIOD' :
             currentMod === 0 ? 'HR' : currentMod;
  }

  getNextClass = (now, currentMod) => {
    const { schedule } = this.props;
    const future = new Date(now.getTime());
    future.setMinutes(future.getMinutes() + 5, 0);
    const nextMod = currentMod === 'HR' ? 1 :
                      currentMod === 'PASSING PERIOD' ? this.getCurrentMod(future) :
                        currentMod + 1 <= 14 ? currentMod + 1 : 'N/A';

    return nextMod !== 'N/A' ?
      schedule.filter(mod => {
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
    return new Date().setHours(...schedule.slice(-1)[0][1].split(':'), 0) - now;
  }

  getTimeUntilBegin = () => {
    const now = new Date();
    const schedule = SCHEDULE[now.getDay() === 3 ? 'wednesday' : 'regular'];
    return new Date().setHours(...schedule[0][0].split(':'), 0) - now;
  }

  formatTime = milliseconds => {
    const pad = num => ('00' + num ).slice(-2);

    const ms = milliseconds % 1000;
    milliseconds = (milliseconds - ms) / 1000;
    const seconds = milliseconds % 60;
    milliseconds = (milliseconds - seconds) / 60;
    const minutes = milliseconds % 60;
    const hours = (milliseconds - minutes) / 60;

    return `${hours === 0 ? `${minutes}` : `${hours}:${pad(minutes)}`}:${pad(seconds)}`;
  }

  uploadProfilePhoto = async newPhoto => {
    try {
      await AsyncStorage.setItem(`${this.state.username.toLowerCase()}:profilePhoto`, newPhoto ? `data:image/jpeg;base64,${newPhoto}` : 'BlankUser');
      this.setState({
        profilePhoto: newPhoto ? `data:image/jpeg;base64,${newPhoto}` : 'BlankUser'
      });
    } catch(error) {
      Alert.alert('Error', 'Something went wrong saving your profile picture.');
    }
  }

  onBackgroundImageLoad = () => {
    this.setState({
      bgRef: findNodeHandle(this.bgImage)
    });
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    clearInterval(this.endDayInterval);
    clearInterval(this.beginDayInterval);
    AppState.removeEventListener('change');
  }

  render() {
    const {
      timeUntil,
      endTimeUntil,
      beginTimeUntil,
      currentMod,
      nextMod,
      profilePhoto,
      loadingProfileImage,
      bgRef
    } = this.state;

    const {
      name,
      classOf,
      homeroom,
      counselor,
      dean,
      id
    } = this.props;

    const formattedTimeUntil = this.formatTime(timeUntil);
    const now = new Date();
    const today = now.getDay();

    now.setMinutes(now.getMinutes() + 5);
    const nextModPassingPeriod = this.getCurrentMod(now);

    const profileImage = !loadingProfileImage ? profilePhoto && profilePhoto !== 'BlankUser' ? {
      uri: profilePhoto
    } : BlankUser : LoadingGIF;
    const backgroundImage = !loadingProfileImage && profilePhoto && profilePhoto !== 'BlankUser' && {
      uri: profilePhoto
    };

    return (
      <View style={styles._dashboardContainer}>
        <HamburgerMenu navigation={this.props.navigation} />
        <View style={styles._dashboardSwiperContainer}>
          {
            backgroundImage &&
              <View>
                <Image
                  ref={img => this.bgImage = img}
                  source={backgroundImage}
                  onLayout={this.onBackgroundImageLoad}
                  style={styles.dashboardUserImageBlur}
                />
                <BlurView
                  viewRef={bgRef}
                  blurType="light"
                  blurAmount={10}
                  style={styles.dashboardUserImageBlur}
                />
              </View>
          }
          <Carousel
            autoplay={false}
            bullets
            bulletStyle={styles._dashboardSwiperDot}
            chosenBulletStyle={styles._dashboardSwiperActiveDot}
            style={styles._dashboardSwiperContainer}
          >
            <View style={styles._dashboardUserProfile}>
              <PhotoUpload
                resetPhoto={BlankUser}
                onReset={this.uploadProfilePhoto}
                onPhotoSelect={this.uploadProfilePhoto}
              >
                <Image
                  source={profileImage}
                  style={styles._dashboardUserImage}
                />
              </PhotoUpload>
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
              <View style={styles._dashboardUserInfoContainer}>
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
          </Carousel>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles._dashboardInfoContainer}
          style={styles._dashboardInfo}
        >
          {
            currentMod ?
              (
                (typeof currentMod === 'number' || currentMod === 'HR') && nextMod ?
                  <InMod
                    currentModNumber={currentMod}
                    untilModIsOver={formattedTimeUntil}
                    nextMod={nextMod.title}
                    nextModInfo={nextMod.body}
                  />
                :
                  currentMod === 'PASSING PERIOD' && nextMod ?
                    <PassingPeriod
                      untilPassingPeriodIsOver={formattedTimeUntil}
                      nextModNumber={nextModPassingPeriod}
                      nextMod={nextMod.title}
                      nextModInfo={nextMod.body}
                    />
                  :
                    currentMod !== 'BEFORE' &&
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
            today < 6 && today !== 0 && currentMod && currentMod !== 'N/A' &&
              [
                {
                  value: this.formatTime(currentMod === 'BEFORE' ? beginTimeUntil : endTimeUntil),
                  title: currentMod === 'BEFORE' ?
                           'UNTIL SCHOOL STARTS' : today === 5 ? 'UNTIL WEEKEND' : 'UNTIL DAY IS OVER'
                }
              ].map(infoMap)
          }
        </ScrollView>
      </View>
    );
  }
}

const dashboardSwiperDotConfig = {
  margin: 4,
  marginTop: 20,
  borderWidth: 0,
  width: '$dashboardSwiperDotSize',
  height: '$dashboardSwiperDotSize'
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
    width: '100%',
    height: '$dashboardSwiperContainerSize',
    backgroundColor: 'transparent'
  },
  dashboardSwiperDot: {
    ...dashboardSwiperDotConfig,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dashboardSwiperActiveDot: {
    ...dashboardSwiperDotConfig,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  dashboardUserProfile: {
    alignItems: 'center',
    width: Dimensions.get('window').width,
    height: '$dashboardSwiperContainerSize'
  },
  dashboardUserImageBlur: {
    position: 'absolute',
    width: '100%',
    height: '$dashboardSwiperContainerSize'
  },
  dashboardUserImage: {
    width: '$dashboardUserImageSize',
    height: '$dashboardUserImageSize',
    borderRadius: '$dashboardUserImageSize / 2',
    marginTop: 30,
    marginBottom: 5
  },
  dashboardUserName: {
    fontFamily: 'Roboto-Light',
    fontSize: 25
  },
  dashboardUserClassOf: {
    fontFamily: 'Roboto-Light',
    fontSize: 15,
    margin: 5,
    marginBottom: 30
  },
  dashboardUserInfo: {
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
    height: '$dashboardSwiperContainerSize'
  },
  dashboardUserInfoContainer: {
    paddingTop: 12
  },
  dashboardUserInfoCardTextContainer: {
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    flexDirection: 'row'
  },
  dashboardUserInfoCardTextType: {
    fontFamily: 'Roboto-Regular',
    fontSize: 17,
    paddingRight: 0,
    padding: 5
  },
  dashboardUserInfoCardText: {
    fontFamily: 'Roboto-Light',
    fontSize: 17,
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

const mapStateToProps = ({
  name,
  classOf,
  homeroom,
  counselor,
  dean,
  id,
  schedule
}) => ({
  name,
  classOf,
  homeroom,
  counselor,
  dean,
  id,
  schedule
});

export default connect(mapStateToProps)(Dashboard);
