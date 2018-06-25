import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import { Icon } from 'native-base';
import Carousel from 'react-native-snap-carousel';
import { connect } from 'react-redux';
import moment from 'moment';

import ScheduleCard from '../components/ScheduleCard';
import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';
import { WIDTH, HEIGHT } from '../constants/constants';

const mapStateToProps = ({
  schedule, dayInfo, specialDates,
}) => ({
  schedule, dayInfo, specialDates,
});

@waitForAnimation
@withHamburger
@connect(mapStateToProps)
export default class Schedule extends Component {
  renderItem = ({ item }) => {
    const { dayInfo, specialDates } = this.props;
    return (
      <ScheduleCard content={item} dayInfo={dayInfo} specialDates={specialDates} />
    );
  }

  render() {
    // Monday is 0, Friday is 4
    const currentDay = moment().weekday();

    return (
      <Carousel
        loop
        firstItem={Math.min(currentDay, 4)}
        data={this.props.schedule}
        renderItem={this.renderItem}
        sliderWidth={WIDTH}
        itemWidth={WIDTH * 0.8}
        containerCustomStyle={styles.container}
        contentContainerCustomStyle={styles.content}
      />
    );
  }
}

Schedule.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="schedule" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { marginTop: HEIGHT * 0.1 },
  icon: { fontSize: 20 },
});
