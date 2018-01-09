import React, { Component } from 'react';
import {
  Alert,
  Animated,
  AsyncStorage,
  Dimensions,
  Image,
  InteractionManager,
  Platform,
  View
} from 'react-native';

import { connect } from 'react-redux';

import EStyleSheet from 'react-native-extended-stylesheet';
import Carousel from 'react-native-looped-carousel';

import HamburgerMenu from './HamburgerMenu.js';
import ScheduleCard from './ScheduleCard.js';
import LoadingGIF from '../assets/images/loading.gif';

class Schedule extends Component {
  state = {
    loading: true,
    isTimes1: false,
    isTimes2: false,
    isTimes3: false,
    isTimes4: false,
    isTimes5: false
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.setState({
        loading: false
      });
    });
  }

  clearTimes = page => {
    this.setState({
      [`isTimes${page + 1}`]: false
    });
  }

  toggleTimes = day => {
    const key = `isTimes${day}`;

    this.setState(({ [key]: isTimes }) => ({
      [key]: !isTimes
    }));
  }

  render() {
    const { loading } = this.state;
    const { schedule } = this.props;
    const today = new Date().getDay();

    return (
      <View style={styles._scheduleContainer}>
        <HamburgerMenu navigation={this.props.navigation} />
        {
          !loading && schedule ?
            <Carousel
              width={Dimensions.get('window').width}
              height={Dimensions.get('window').height}
              style={styles._scheduleSwiperContainer}
              currentPage={today > 0 && today < 6 ? today - 1 : 0}
              autoplay={false}
              bullets={Platform.OS !== 'android'}
              bulletStyle={styles._scheduleDotStyle}
              chosenBulletStyle={styles._scheduleActiveDotStyle}
              onAnimateNextPage={this.clearTimes}
            >
              {
                Array.from(new Array(5), (_, i) => i).map(key =>
                  <ScheduleCard
                    key={key}
                    schedule={schedule}
                    day={key + 1}
                    isTimes={this.state[`isTimes${key + 1}`]}
                    onToggleTimes={this.toggleTimes}
                  />
                )
              }
            </Carousel>
          :
            <Image
              source={LoadingGIF}
              style={styles._loadingGIF}
            />
        }
      </View>
    );
  }
}

const {
  width,
  height
} = Dimensions.get('window');

const scheduleSwiperDotConfig = {
  margin: 4,
  ...Platform.select({
    ios: {
      top: -height + 105
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
  loadingGIF: {
    width: 40,
    height: 40
  },
  scheduleSwiperContainer: {
    width,
    height
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

const mapStateToProps = ({ schedule }) => ({
  schedule
});

export default connect(mapStateToProps)(Schedule);
