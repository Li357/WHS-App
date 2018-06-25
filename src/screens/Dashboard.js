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
import { HEIGHT, PASSING_PERIOD_FACTOR, AFTER_SCHOOL, BEFORE_SCHOOL } from '../constants/constants';

const mapStateToProps = ({
  loginError, dates, ...rest
}) => ({
  ...rest,
});

const isDuringMod = currentMod => currentMod >= 0 && currentMod <= 14;

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
  state = { info: [] }

  componentDidMount() {
    const now = moment();
    const currentMod = this.getCurrentMod(now);
    const nextClass = this.getNextClass(currentMod, now);

    if (currentMod > PASSING_PERIOD_FACTOR) {
      if (currentMod === BEFORE_SCHOOL) {
        this.setState({
          info: this.getBeforeSchoolInfo(),
        });
        return;
      }
      this.setState({
        info: currentMod === AFTER_SCHOOL
          ? this.getAfterSchoolInfo()
          : this.getDuringPassingPeriodInfo(nextClass),
      });
    } else {
      this.setState({
        info: this.getDuringModInfo(currentMod, nextClass),
      });
    }
    // TODO: End of day countdown
  }

  getDuringModInfo = (currentMod, nextClass) => [
    {
      title: 'Current Mod',
      value: currentMod
    },
    {
      title: 'Next Class',
      value: nextClass.title,
      subtitle: nextClass.body,
    },
    // TODO: Until mod over countdown
  ]

  getDuringPassingPeriodInfo = (nextClass) => [
    {
      title: 'Next Class',
      value: nextClass.title,
      subtitle: nextClass.body,
    }
    // TODO: Until passing period over countdown
  ]

  getBeforeSchoolInfo = () => [/* TODO: Before school countdown */]

  getAfterSchoolInfo = () => [{ value: 'You\'re done for the day' }]

  /**
   * Get current mod based on passed date, defaults to now
   */
  getCurrentMod = (date = moment()) => {
    const { dayInfo: { start, end, schedule } } = this.props;

    if (date.isAfter(end)) {
      return AFTER_SCHOOL;
    } else if (date.isBefore(start)) {
      return BEFORE_SCHOOL;
    }

    return schedule.reduce((currentMod, timePair, index, array) => {
      const [modStart, modEnd] = timePair.map(time => moment(`${time}:00`, 'kk:mm:ss'));
      const modNumber = index + (date.day() === 3 ? 1 : 0);
      const isBetween = date.isAfter(modStart) && date.isBefore(modEnd);

      if (isBetween) {
        return modNumber;
      }

      const lastMod = array[index - 1];
      if (lastMod) {
        const lastModEnd = moment(`${lastMod[1]}:00`, `kk:mm:ss`);
        const isPassingPeriod = date.isBefore(modStart) && date.isAfter(lastModEnd);

        return isPassingPeriod
          ? PASSING_PERIOD_FACTOR + modNumber
          : currentMod;
      }
      return currentMod;
    }, 0);
  }

  /**
   * Get next class based on next mod
   */
  getNextClass = (currentMod, date = moment()) => {
    const { schedule } = this.props;
    const normalizedDay = date.day() - 1;
    const userDaySchedule = schedule[normalizedDay];
    return currentMod > PASSING_PERIOD_FACTOR
      ? userDaySchedule[currentMod - PASSING_PERIOD_FACTOR]
      : userDaySchedule[currentMod + 1];
  }

  renderForeground = () => <UserInfo {...this.props} />
  renderBackground = () => <UserBackground {...this.props} />

  render() {
    const { info } = this.state;

    return (
      <ParallaxScrollView
        parallaxHeaderHeight={HEIGHT * 0.35}
        stickyHeaderHeight={HEIGHT * 0.1}
        renderForeground={this.renderForeground}
        renderBackground={this.renderBackground}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {info.map(item => <DashboardBlock key={item.title} {...item} />)}
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
