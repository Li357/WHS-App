import React, { Component } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Icon } from 'native-base';
import Carousel from 'react-native-snap-carousel';
import { connect } from 'react-redux';
import _ from 'lodash';

import ScheduleCard from '../components/ScheduleCard';
import withHamburger from '../util/withHamburger';

const { width } = Dimensions.get('window');
const mapStateToProps = ({ schedule }) => ({ schedule });

@withHamburger
@connect(mapStateToProps)
export default class Schedule extends Component {
  state = { schedule: [] }

  static getDerivedStateFromProps({ schedule }) {
    if (schedule.length !== 5) {
      const grouped = _(schedule)
        .groupBy('day')
        .values()
        .value();

      return { schedule: grouped };
    }
    return null;
  }

  renderItem = ({ item }) => <ScheduleCard content={item} />

  render() {
    return (
      <Carousel
        data={this.state.schedule}
        renderItem={this.renderItem}
        sliderWidth={width * 0.8}
        itemWidth={width * 0.75}
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
  icon: { fontSize: 20 },
});
