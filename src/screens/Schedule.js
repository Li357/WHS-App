import React, { Component } from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import { Icon } from 'native-base';
import Carousel from 'react-native-snap-carousel';
import { connect } from 'react-redux';
import _ from 'lodash';

import ScheduleCard from '../components/ScheduleCard';
import withHamburger from '../util/withHamburger';

const { width, height } = Dimensions.get('window');
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
        loop
        data={this.state.schedule}
        renderItem={this.renderItem}
        sliderWidth={width}
        itemWidth={width * 0.8}
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
  content: { marginTop: height * 0.1 },
  icon: { fontSize: 20 },
});
