import React, { Component } from 'react';
import {
  AppState,
  Dimensions,
  Image,
	Platform,
  ScrollView,
  Text,
  View,
  findNodeHandle
} from 'react-native';

import { connect } from 'react-redux';
import { saveProfilePhoto } from './actions/actionCreators.js';

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

const DEVIATION = (new Date().getDay() !== 3 ? 29 : 37) * 1000;

class Dashboard extends Component {
  state = {
    timeUntil: 0,
    endTimeUntil: 0,
    beginTimeUntil: 0,
    isBreak: false,
    isSummer: false,
    crossSectionedMods: null,
    bgRef: null,
    schedule: [],
    containsAssembly: false,
    assemblyIndex: undefined
  }

  async componentDidMount() {
    const now = new Date(new Date() - DEVIATION);
    const today = now.getDay();

    await this.calculateBreak(); //wait until state is set (is getting batched)

    const {
      isBreak,
      isSummer
    } = this.state;

    if(today < 6 && today !== 0 && !isBreak && !isSummer) {
      await this.selectSchedule();
      if(this.getCurrentMod(now) === 'BEFORE') {
        this.startBeginDayCountdown();
      } else {
        this.runTimer();
        this.startEndDayCountdown();
      }
      this.calculateCrossSectionMods();
    }

    AppState.addEventListener('change', async state => {
      await this.calculateBreak();

      const newToday = new Date().getDay();
      if(newToday < 6 && newToday !== 0 && !this.state.isBreak && !this.state.isSummer) {
        clearInterval(this.interval);
        clearInterval(this.beginDayInterval);
        clearInterval(this.endDayInterval);
        if(state === 'active') {
          await this.selectSchedule();
          if(this.getCurrentMod(new Date(new Date() - DEVIATION)) === 'BEFORE') {
            this.startBeginDayCountdown();
          } else {
            this.runTimer();
            this.startEndDayCountdown();
          }
          this.calculateCrossSectionMods();
        }
      }
    });
  }

  selectSchedule = () => {
    const now = new Date();
    const today = now.getDay();
    const { dates } = this.props;
    const isLate = !!dates.find(({
      late,
      day,
      month,
      year
    }) =>
      late && +new Date(year, month - 1, day) === now.setHours(0, 0, 0, 0)
    );
    const isLast = !!dates.find(({
      last,
      day,
      month,
      year
    }) =>
      last && +new Date(year, month - 1, day) === now.setHours(0, 0, 0, 0)
    );
    const hasAssembly = !!dates.find(({
      assembly,
      day,
      month,
      year
    }) =>
      assembly && +new Date(year, month - 1, day) === now.setHours(0, 0, 0, 0)
    );
    this.setState({
      schedule: SCHEDULE[
        isLast ?
          'oneOClock'
        :
          !hasAssembly ?
            today === 3 ?
              isLate ?
                'lateStartWednesday'
              :
                'wednesday'
            :
              isLate ?
                'lateStart'
              :
                'regular'
          :
            'assembly'
      ],
      containsAssembly: hasAssembly
    }, () => {
      this.state.schedule.forEach((timePair, index) => {
        if(timePair[2] === 'ASSEMBLY') {
          this.setState({
            assemblyIndex: index
          });
        }
      });
    });
  }

  calculateBreak = () => {
    const {
      dates,
      lastSummerStart
    } = this.props;
    const now = new Date();

    const first = dates.filter(date => date.first)[0];

    this.setState({
      isBreak: !!dates.find(({
        first,
        second,
        last,
        late,
        assembly,
        day,
        month,
        year
      }) =>
        !first && !last && !second && !late && !assembly &&
        +new Date(year, month - 1, day) === now.setHours(0, 0, 0, 0)
      ),
      isSummer: now >= lastSummerStart && now <= new Date(first.year, first.month - 1, first.day)
    });
  }

  calculateCrossSectionMods = () => {
    const { schedule } = this.props;
    const today = new Date().getDay();

    this.setState({
      crossSectionedMods: schedule.filter((scheduleItem, index, array) =>
        scheduleItem.day === today && index !== array.findIndex(anotherItem =>
          anotherItem.day === scheduleItem.day && anotherItem.startMod === scheduleItem.startMod
        )
      )
    });
  }

  runTimer = () => {
    const now = new Date(new Date() - DEVIATION);
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
    const now = new Date(new Date() - DEVIATION);
    const wednesday = now.getDay() === 3;
    const {
      schedule,
      assemblyIndex,
      containsAssembly
    } = this.state;

    if(typeof currentMod === 'number' || currentMod === 'HR' || currentMod === 'ASSEMBLY') {
      const modified = currentMod === 'ASSEMBLY' ? assemblyIndex : currentMod + Boolean(containsAssembly && currentMod >= assemblyIndex);
      const endMod = new Date(now.getTime()).setHours(...schedule[+(currentMod !== 'HR') && modified - wednesday][1].split(':'), 0);

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
        const future = new Date(new Date() - DEVIATION);
        future.setMinutes(future.getMinutes() + 1, 0);
        const nextMod = this.getCurrentMod(future);
        const nextModClass = this.getNextClass(future, nextMod);
        this.setState({
          timeUntil: this.calculateModCountdown(nextMod),
          currentMod: nextMod,
          nextMod: nextModClass,
        });
        this.calculateCrossSectionMods();
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
    const { schedule } = this.state;

    if(schedule.length > 0) {
      const nowDay = now.getDay();
      const wednesday = nowDay === 3;
      const {
        containsAssembly,
        assemblyIndex
      } = this.state;

      const afterEnd = new Date().setHours(...schedule.slice(-1)[0][1].split(':'), 0);
      const first = new Date().setHours(...schedule[0][0].split(':'), 0);
      if(nowDay > 5 || nowDay === 0 || now - afterEnd >= 0) {
        return 'N/A';
      }

      if(now < first) {
        return 'BEFORE';
      }

      const currentMod = schedule.reduce((current, timePair, index) => {
        const isAssembly = timePair[2] === 'ASSEMBLY';
        const [start, end] = timePair.slice(0, 2).map(time => time.split(':'));
        const retVal = wednesday ? index + 1 : index;

        return now - new Date(now.getTime()).setHours(...start, 0) >= 0 && now - new Date().setHours(...end, 0) < 0 ?
          isAssembly ?
            'ASSEMBLY'
          :
            retVal - Boolean(containsAssembly && index >= assemblyIndex)
        :
          current;
      }, -1);

      return currentMod === -1 ? 'PASSING PERIOD' :
               currentMod === 0 ? 'HR' : currentMod;
    }
  }

  getNextClass = (now, currentMod) => {
    const { schedule } = this.props;
    const { assemblyIndex } = this.state;
    const future = new Date(now.getTime() - DEVIATION);
    future.setMinutes(future.getMinutes() + 6, 0);
    const nextMod = currentMod === 'HR' ? 1 :
      currentMod === 'PASSING PERIOD' ?
        this.getCurrentMod(future)
      :
        currentMod === 'ASSEMBLY' ?
          assemblyIndex
        :
          currentMod === assemblyIndex - 1 ?
            'ASSEMBLY'
          :
            currentMod + 1 <= 14 ?
              currentMod + 1
            :
              'N/A';

    return nextMod !== 'N/A' && nextMod !== 'ASSEMBLY' ?
      schedule.filter(mod => {
        const mods = Array.from(new Array(mod.length), (_, i) => i).map(key =>
          key + mod.startMod
        );

        return mod.day === now.getDay() && mods.includes(nextMod);
      })[0] || {
        title: 'Open Mod',
        body: ''
      }
    :
      nextMod === 'ASSEMBLY' ?
        {
          title: 'ASSEMBLY',
          body: ''
        }
      :
        {
          title: 'N/A',
          body: ''
        };
  }

  getTimeUntilEnd = () => {
    const now = new Date(new Date() - DEVIATION);
    const { schedule } = this.state;
    return new Date().setHours(...schedule.slice(-1)[0][1].split(':'), 0) - now;
  }

  getTimeUntilBegin = () => {
    const now = new Date(new Date() - DEVIATION);
    const { schedule } = this.state;
    return new Date().setHours(...schedule[0][0].split(':'), 0) - now;
  }

  formatTime = milliseconds => {
    const pad = num => `00${num}`.slice(-2);

    let millis = milliseconds;
    const ms = millis % 1000;
    millis = (millis - ms) / 1000;
    const seconds = millis % 60;
    millis = (millis - seconds) / 60;
    const minutes = millis % 60;
    const hours = (millis - minutes) / 60;

    return `${hours === 0 ? `${minutes}` : `${hours}:${pad(minutes)}`}:${pad(seconds)}`;
  }

  uploadProfilePhoto = async newPhoto => {
    const {
      dispatch,
      username,
      schoolPicture
    } = this.props;

    await dispatch(saveProfilePhoto(username, newPhoto ? `data:image/jpeg;base64,${newPhoto}` : schoolPicture));
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
      isBreak,
      isSummer,
      crossSectionedMods,
      bgRef,
      assemblyIndex
    } = this.state;

    const {
      name,
      classOf,
      homeroom,
      counselor,
      dean,
      id,
      profilePhoto,
      schoolPicture
    } = this.props;

    const formattedTimeUntil = this.formatTime(timeUntil);
    const now = new Date(new Date() - DEVIATION);
    const today = now.getDay();

    const wednesdayFirstClass = this.getNextClass(now, 0);

    now.setMinutes(now.getMinutes() + 6);
    const nextModPassingPeriod = this.getCurrentMod(now);

    const profileImage = profilePhoto ?
      profilePhoto.includes('blank-user.png') ?
        BlankUser
      :
        {
          uri: profilePhoto
        }
    :
      schoolPicture;

    return (
      dashboardInfo = [
          <View style={styles._dashboardUserProfile} key={0}>
            <PhotoUpload
              resetPhoto={schoolPicture}
              onReset={this.uploadProfilePhoto}
              onPhotoSelect={this.uploadProfilePhoto}
            >
              <Image
                source={profileImage}
                style={styles._dashboardUserImage}
              />
            </PhotoUpload>
            <Text style={styles._dashboardUserName}>
              {name}
            </Text>
            <Text style={styles._dashboardUserClassOf}>
              {classOf}
            </Text>
          </View>,
          homeroom && counselor && dean && id ?
            <View style={styles._dashboardUserInfo} key={1}>
              <View style={styles._dashboardUserInfoContainer}>
                {
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
                <View style={styles._dashboardUserInfoCardTextContainer}>
                  <Text style={styles._dashboardUserInfoCardTextType}>Student ID: </Text>
                  <Text style={styles._dashboardUserInfoCardText}>{id}</Text>
                </View>
              </View>
            </View>
          :
            null
      ],
      <View style={styles._dashboardContainer}>
        <HamburgerMenu navigation={this.props.navigation} />
        {
          name && classOf && profilePhoto.length > 1 &&
            <View style={styles._dashboardSwiperContainer}>
              {
                Platform.OS === 'ios' && profileImage && !profilePhoto.includes('blank-user.png') ?
                  <View>
    								<Image
                      ref={img => {
                        this.bgImage = img
                      }}
                      source={profileImage}
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
                :
                  <View style={{
                    backgroundColor: 'lightgray'
                  }} />
              }
              {
                homeroom !== null && counselor !== null && dean !== null ?
                  <Carousel
                    autoplay={false}
                    bullets
                    bulletStyle={styles._dashboardSwiperDot}
                    chosenBulletStyle={styles._dashboardSwiperActiveDot}
                    style={styles._dashboardSwiperContainer}
                  >
                    {dashboardInfo}
                  </Carousel>
                :
                  dashboardInfo
              }
            </View>
        }
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles._dashboardInfoContainer}
          style={styles._dashboardInfo}
        >
          {
            currentMod ?
              (
                (typeof currentMod === 'number' || currentMod === 'HR' || currentMod === 'ASSEMBLY') && nextMod && crossSectionedMods ?
                  <InMod
                    currentModNumber={currentMod}
                    untilModIsOver={formattedTimeUntil}
                    nextMod={nextMod.title}
                    nextModInfo={nextMod.body}
                    crossSection={crossSectionedMods}
                    assembly={currentMod === 'ASSEMBLY'}
                  />
                :
                  currentMod === 'PASSING PERIOD' && nextMod && crossSectionedMods ?
                    <PassingPeriod
                      untilPassingPeriodIsOver={formattedTimeUntil}
                      nextModNumber={nextModPassingPeriod}
                      nextMod={nextMod.title}
                      nextModInfo={nextMod.body}
                      crossSection={crossSectionedMods}
                      assembly={nextModPassingPeriod === 'ASSEMBLY'}
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
              (
                today < 6 && today !== 0 && !isBreak && !isSummer ?
                  <Image
                    source={LoadingGIF}
                    style={styles._dashboardInfoLoadingGIF}
                  />
                :
                  <Text style={styles._dashboardInfoText}>{`Enjoy your ${isBreak || isSummer ? isSummer ? 'summer' : 'break' : 'weekend'}!`}</Text>
              )
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
          {
            today === 3 && currentMod && currentMod === 'BEFORE' && beginTimeUntil <= 300000 && //less than 5 minutes
              [
                {
                  value: wednesdayFirstClass.title,
                  title: 'NEXT MOD',
                  textStyle: {
                    fontSize: 60
                  }
                },
                {
                  value: wednesdayFirstClass.body,
                  title: 'NEXT MOD ROOM',
                  textStyle: {
                    fontSize: 60
                  }
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
};

const styles = EStyleSheet.create({
  $dashboardSwiperContainerSize: Dimensions.get('window').height === 812 ? 250 : 230, //Handles iPhone X
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
  username,
  name,
  classOf,
  homeroom,
  counselor,
  dean,
  id,
  schedule,
  profilePhoto,
  schoolPicture,
  dates,
  lastSummerStart
}) => ({
  username,
  name,
  classOf,
  homeroom,
  counselor,
  dean,
  id,
  schedule,
  profilePhoto,
  schoolPicture,
  dates,
  lastSummerStart
});

export default connect(mapStateToProps)(Dashboard);
