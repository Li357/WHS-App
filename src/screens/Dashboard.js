import React, { Component } from 'react';
import { AppState } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { Icon } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import moment from 'moment';

import UserInfo from '../components/UserInfo';
import UserBackground from '../components/UserBackground';
import DashboardBlock from '../components/DashboardBlock';
import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';
import { getCurrentMod, getNextClass } from '../util/querySchedule';
import { getBeforeSchoolInfo, getAfterSchoolInfo } from '../util/dashboardInfoGetters';
import { HEIGHT, PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL } from '../constants/constants';

const mapStateToProps = ({
  loginError, dates, ...rest
}, ownProps) => ({
  ...rest,
  ...ownProps,
});

@waitForAnimation
@withHamburger
@withNavigation
@connect(mapStateToProps)
export default class Dashboard extends Component {
  intervalIds = []

  constructor(props) {
    super(props);
    // This needs to be in the constructor for it to be registered by React Navigation
    this.blurSubscriber = this.props.navigation.addListener('willBlur', this.clearCountdowns);
    AppState.addEventListener('change', this.handleAppStateChange);

    this.updateCountdowns(props, true);
  }

  componentWillUnmount() {
    this.clearCountdowns();
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.blurSubscriber.remove();
  }

  handleAppStateChange = (newStatus) => {
    switch (newStatus) {
      case 'inactive':
        this.clearCountdowns();
        break;
      case 'active':
        this.updateCountdowns(this.props);
        break;
      default:
    }
  }

  calculateScheduleInfo = ({ dayInfo, schedule }, now = moment()) => {
    const currentMod = getCurrentMod(dayInfo, now);
    const nextClass = getNextClass(schedule, currentMod, now);

    return {
      currentMod,
      nextClass,
    };
  }

  createCountdown = (key) => {
    const id = setInterval(() => {
      // Need to floor because differences are not in exact 1000 increments
      if (Math.floor(this.state[key] / 1000) === 0) {
        clearInterval(id);
        this.updateCountdowns(this.props);
        return;
      }
      this.setState(prevState => ({
        [key]: prevState[key] - 1000,
      }));
    }, 1000);
    this.intervalIds.push(id);
  }

  updateCountdowns = (props, firstTimeSet = false, now = moment()) => {
    const { currentMod, nextClass } = this.calculateScheduleInfo(props, now);
    const { start, end, schedule } = props.dayInfo;
    const isDuringMod = currentMod < PASSING_PERIOD_FACTOR;
    const isPassingPeriod = currentMod > PASSING_PERIOD_FACTOR && currentMod < BEFORE_SCHOOL;

    const untilModEnd = isDuringMod
      ? moment(`${schedule[currentMod][1]}:ss`, 'kk:mm:ss').diff(now)
      : 0;

    const untilPassingPeriodEnd = isPassingPeriod
      ? moment(`${schedule[currentMod - PASSING_PERIOD_FACTOR][0]}:ss`, 'kk:mm:ss').diff(now)
      : 0;

    const untilDayStart = start.diff(now);
    const untilDayEnd = end.diff(now);

    const newState = {
      currentMod,
      nextClass,
      untilDayStart,
      untilDayEnd,
      untilModEnd,
      untilPassingPeriodEnd,
    };

    if (firstTimeSet) {
      this.state = newState;
    } else {
      this.setState(newState);
    }
    this.startCountdowns(currentMod, untilDayStart, untilDayEnd);
  }

  startCountdowns = (currentMod, untilDayStart, untilDayEnd) => {
    if (untilDayStart < 0 && untilDayEnd >= 0) {
      this.createCountdown('untilDayEnd');
      if (currentMod < PASSING_PERIOD_FACTOR) {
        this.createCountdown('untilModEnd');
        return;
      }
      this.createCountdown('untilPassingPeriodEnd');
    } else if (untilDayStart >= 0) {
      this.createCountdown('untilDayStart');
    }
  }

  clearCountdowns = () => {
    this.intervalIds.forEach(id => {
      clearInterval(id);
    });
  }

  renderForeground = () => <UserInfo {...this.props} />
  renderBackground = () => <UserBackground {...this.props} />

  render() {
    const {
      currentMod, nextClass, untilDayStart, untilDayEnd, untilModEnd, untilPassingPeriodEnd,
    } = this.state;

    let info = [];
    if (currentMod > PASSING_PERIOD_FACTOR) {
      if (currentMod === BEFORE_SCHOOL) {
        info = getBeforeSchoolInfo(untilDayStart);
      } else {
        info = currentMod === AFTER_SCHOOL
          ? getAfterSchoolInfo()
          : []//getDuringPassingPeriodInfo(nextClass, untilPassingPeriodEnd, untilDayEnd);
      }
    } else {
      //info = getDuringModInfo(currentMod, nextClass, untilModEnd, untilDayEnd);
    }

    return (
      <ParallaxScrollView
        parallaxHeaderHeight={HEIGHT * 0.35}
        stickyHeaderHeight={HEIGHT * 0.1}
        renderForeground={this.renderForeground}
        renderBackground={this.renderBackground}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {info.map(item => <DashboardBlock key={item.title || item.value} {...item} />)}
      </ParallaxScrollView>
    );
  }
}

// Until decorators get fixed, need to assign outside of class
Dashboard.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="dashboard" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = EStyleSheet.create({
  container: { alignItems: 'center' },
  icon: { fontSize: 20 },
});
