import React, { Component } from 'react';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { Icon } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import moment from 'moment';

import UserInfo from '../components/UserInfo';
import UserBackground from '../components/UserBackground';
import DashboardBlock from '../components/DashboardBlock';
import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';
import { getCurrentMod, getNextClass } from '../util/querySchedule';
import { HEIGHT, PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL } from '../constants/constants';

const mapStateToProps = ({
  loginError, dates, ...rest
}) => ({
  ...rest,
});

// NOTE: This is decoupled for future modularity
const getDuringModInfo = (currentMod, nextClass) => [
  {
    title: 'Current Mod',
    value: currentMod,
  },
  {
    title: 'Next Class',
    value: nextClass.title,
    subtitle: nextClass.body,
  },
  // TODO: Until mod over countdown
];
const getDuringPassingPeriodInfo = nextClass => [
  {
    title: 'Next Class',
    value: nextClass.title,
    subtitle: nextClass.body,
  },
  // TODO: Until passing period over countdown
];
const getBeforeSchoolInfo = () => [/* TODO: Before school countdown */];
const getAfterSchoolInfo = () => [{ value: 'You\'re done for the day' }];

/**
 * Default info to display:
 * - During mod:
 *    - Current (half) mod
 *    - Until (half) mod is over
 *    - Next (half) mod
 * - Passing Period
 *    - Until passing period is over
 *    - Next (half) mod
 */

@waitForAnimation
@withHamburger
@connect(mapStateToProps)
export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    const now = moment();
    const { currentMod, nextClass } = this.calculateScheduleInfo(props, now);
    const { start, end } = props.dayInfo;

    // TODO: Add mod end countdown
    this.state = {
      currentMod,
      nextClass,
      untilDayStart: now.diff(start),
      untilDayEnd: now.diff(end),
    };
  }

  componentDidMount() {
    const { untilDayStart, untilDayEnd } = this.state;
    if (untilDayStart >= 0 && untilDayEnd >= 0) {
      this.createCountdown('untilDayEnd');
      // TODO: Add mod end countdown
    } else if (untilDayStart < 0) {
      this.createCountdown('untilDayStart');
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

  createCountdown = (key, shouldRecalculateInfo = true) => {
    const id = setInterval(() => {
      if (this.state[key] === 0) {
        clearInterval(id);
        if (shouldRecalculateInfo) {
          this.setState(this.calculateScheduleInfo(this.props));
        }
        return;
      }
      this.setState(prevState => ({
        [key]: prevState[key] - 1,
      }));
    }, 1000);
  }

  renderForeground = () => <UserInfo {...this.props} />
  renderBackground = () => <UserBackground {...this.props} />

  render() {
    const {
      currentMod, nextClass, untilDayStart, untilDayEnd
    } = this.state;

    let info;
    if (currentMod > PASSING_PERIOD_FACTOR) {
      if (currentMod === BEFORE_SCHOOL) {
        info = getBeforeSchoolInfo(untilDayStart);
      } else {
        info = currentMod === AFTER_SCHOOL
          ? getAfterSchoolInfo()
          : getDuringPassingPeriodInfo(nextClass, untilDayEnd);
      }
    } else {
      info = getDuringModInfo(currentMod, nextClass, untilDayEnd);
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
