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
const getDuringModInfo = (currentMod, nextClass, untilModEnd, untilDayEnd) => [
  {
    title: 'Current mod',
    value: currentMod,
  },
  {
    title: 'Until mod ends',
    value: moment.duration(untilModEnd).format('h:m:s'),
  },
  {
    title: 'Next class',
    value: nextClass.title,
    subtitle: nextClass.body,
  },
  {
    title: 'Until day ends',
    value: moment.duration(untilDayEnd).format('h:m:s'),
  },
];
const getDuringPassingPeriodInfo = (nextClass, untilPassingPeriodEnd, untilDayEnd) => [
  {
    title: 'Next class',
    value: nextClass.title,
    subtitle: nextClass.body,
  },
  {
    title: 'Until passing period ends',
    value: moment.duration(untilPassingPeriodEnd).format('h:m:s'),
  },
  {
    title: 'Until day ends',
    value: moment.duration(untilDayEnd).format('h:m:s'),
  },
];
const getBeforeSchoolInfo = untilDayStart => [
  {
    title: 'Until school day starts',
    value: moment.duration(untilDayStart).format('h:m:s'),
  },
];
const getAfterSchoolInfo = () => [{ value: 'You\'re done for the day' }];

@waitForAnimation
@withHamburger
@connect(mapStateToProps)
export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.updateCountdowns(props, true);
  }

  componentDidMount() {
    const { currentMod, untilDayStart, untilDayEnd } = this.state;
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

  calculateScheduleInfo = ({ dayInfo, schedule }, now = moment()) => {
    const currentMod = getCurrentMod(dayInfo, now);
    const nextClass = getNextClass(schedule, currentMod, now);

    return {
      currentMod,
      nextClass,
    };
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

    const newState = {
      currentMod,
      nextClass,
      untilDayStart: now.diff(start),
      untilDayEnd: end.diff(now),
      untilModEnd,
      untilPassingPeriodEnd,
    };

    if (firstTimeSet) {
      this.state = newState;
      return;
    }
    this.setState(newState);
  }

  createCountdown = key => {
    const id = setInterval(() => {
      if (this.state[key] === 0) {
        clearInterval(id);
        this.updateCountdowns(this.props);
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
      currentMod, nextClass, untilDayStart, untilDayEnd, untilModEnd, untilPassingPeriodEnd,
    } = this.state;
    console.log(this.state);

    let info;
    if (currentMod > PASSING_PERIOD_FACTOR) {
      if (currentMod === BEFORE_SCHOOL) {
        info = getBeforeSchoolInfo(untilDayStart);
      } else {
        info = currentMod === AFTER_SCHOOL
          ? getAfterSchoolInfo()
          : getDuringPassingPeriodInfo(nextClass, untilPassingPeriodEnd, untilDayEnd);
      }
    } else {
      info = getDuringModInfo(currentMod, nextClass, untilModEnd, untilDayEnd);
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
