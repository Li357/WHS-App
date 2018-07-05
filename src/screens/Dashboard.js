import React, { Component } from 'react';
import { AppState } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { List, Icon } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';
import moment from 'moment';

import UserInfo from '../components/UserInfo';
import UserBackground from '../components/UserBackground';
import DashboardBlock from '../components/DashboardBlock';
import CrossSectionBlock from '../components/CrossSectionBlock';
import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';
import { getCurrentMod, getNextClass, isHalfMod } from '../util/querySchedule';
import {
  getBeforeSchoolInfo,
  getAfterSchoolInfo,
  getDuringPassingPeriodInfo,
  getDuringModInfo,
  getDuringWeekendInfo,
  getDuringBreakInfo,
} from '../util/dashboardInfo';
import {
  HEIGHT,
  PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL, BREAK,
} from '../constants/constants';

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
  /* eslint-disable-next-line react/sort-comp */
  intervalIds = []

  constructor(props) {
    super(props);

    const { navigation } = this.props;
    // This needs to be in the constructor for it to be registered by React Navigation
    this.blurSubscriber = navigation.addListener('willBlur', this.clearCountdowns);
    // Start countdowns back when user navigates back to dashboard
    this.focusSubscriber = navigation.addListener('didFocus', () => {
      // Use this.props NOT props (to access latest props)
      this.updateCountdowns(this.props);
    });
    AppState.addEventListener('change', this.handleAppStateChange);

    this.updateCountdowns(props, true);
  }

  componentWillUnmount() {
    this.clearCountdowns();
    AppState.removeEventListener('change', this.handleAppStateChange);
    this.blurSubscriber.remove();
    this.focusSubscriber.remove();
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
      if (this.state[key] > 0) {
        /**
         * This is inevitably a little inaccurate because
         * 1. React Native's layer of abstraction causes a slight delay of interval callback
         * 2. This countdown may start in the middle of a second in which case it will be
         *    less than a second behind the current clock (handling this with an additional
         *    setTimeout is too much complexity for little gain)
         */
        this.setState(prevState => ({
          [key]: prevState[key] - 1000,
        }));
        return;
      }
      clearInterval(id);
      this.updateCountdowns(this.props);
    }, 1000);
    this.intervalIds.push(id);
  }

  updateCountdowns = (props, firstTimeSet = false, now = moment()) => {
    const { currentMod, nextClass } = this.calculateScheduleInfo(props, now);
    const {
      start, end, schedule, isBreak, isSummer,
    } = props.dayInfo;

    /**
     * NOTE: If isBreak/isSummer status changes (i.e. after the last day), dayInfo is not updated
     * until an app state change (just for less complexity)
     */

    // If it is either Summer or a break, there is no need to calculate countdowns
    if (isBreak || isSummer) {
      const newState = {
        currentMod: BREAK,
        nextClass: null,
        untilDayStart: 0,
        untilDayEnd: 0,
        untilModEnd: 0,
        untilPassingPeriodEnd: 0,
        isBreak,
        isSummer,
      };
      if (firstTimeSet) {
        this.state = newState;
      } else {
        this.setState(newState);
      }
      return;
    }

    /**
     * Since getCurrentMod returns index + 1 (to give correct mod number for display), but
     * since arrays are 0-based, it must be decremented by 1 for array access on Wednesdays
     */
    const modNumber = currentMod - Number(now.day() === 3);
    const isDuringMod = modNumber < PASSING_PERIOD_FACTOR;
    const isPassingPeriod = modNumber > PASSING_PERIOD_FACTOR && modNumber < BEFORE_SCHOOL;

    const untilModEnd = isDuringMod
      ? moment(`${schedule[modNumber][1]}:00`, 'k:mm:ss').diff(now)
      : 0;

    const untilPassingPeriodEnd = isPassingPeriod
      ? moment(`${schedule[modNumber - PASSING_PERIOD_FACTOR][0]}:00`, 'k:mm:ss').diff(now)
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
      isBreak,
      isSummer,
    };

    // This handles the initial state set in constructor
    if (firstTimeSet) {
      this.state = newState;
    } else {
      this.setState(newState);
    }
    /**
     * Clear and restart all countdowns on update, all countdowns will be updated when one
     * gets to 0, maintaining the inevitable countdown offset between counters
     */
    this.clearCountdowns();
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
    this.intervalIds.forEach((id) => {
      clearInterval(id);
    });
  }

  selectInfo = () => {
    const {
      currentMod,
      nextClass,
      untilDayStart,
      untilDayEnd,
      untilModEnd,
      untilPassingPeriodEnd,
      isBreak,
      isSummer,
    } = this.state;

    /**
     * This condition should be first so that even on weekends during the summer, the summer
     * message is shown
     */
    if (isSummer || isBreak) {
      return getDuringBreakInfo(isSummer);
    }

    const today = moment().day();
    if (today < 1 || today > 5) {
      return getDuringWeekendInfo();
    }

    /* eslint-disable function-paren-newline */
    if (currentMod <= PASSING_PERIOD_FACTOR) {
      return getDuringModInfo(
        currentMod, nextClass, untilModEnd, untilDayEnd, isHalfMod(currentMod),
      );
    }

    if (currentMod === BEFORE_SCHOOL) {
      return getBeforeSchoolInfo(untilDayStart);
    }

    const nextMod = currentMod - PASSING_PERIOD_FACTOR;
    /* eslint-disable indent */
    return currentMod === AFTER_SCHOOL
      ? getAfterSchoolInfo()
      : getDuringPassingPeriodInfo(
          nextMod,
          nextClass, untilPassingPeriodEnd, untilDayEnd,
          isHalfMod(nextMod),
        );
    /* eslint-enable function-paren-newline, indent */
  }

  renderForeground = () => <UserInfo {...this.props} />
  renderBackground = () => <UserBackground {...this.props} />

  render() {
    const info = this.selectInfo();

    return (
      <ParallaxScrollView
        parallaxHeaderHeight={HEIGHT * 0.35}
        stickyHeaderHeight={HEIGHT * 0.1}
        renderForeground={this.renderForeground}
        renderBackground={this.renderBackground}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <List style={styles.infoContainer}>
          {
            info.map(({ crossSectionedBlock, sourceId, ...item }) => (
              crossSectionedBlock
                ? <CrossSectionBlock key={sourceId} {...item} />
                : <DashboardBlock key={item.title || item.value} {...item} />
            ))
          }
        </List>
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
  infoContainer: { width: '80%' },
});
