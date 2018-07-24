import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { Icon } from 'native-base';
import Carousel from 'react-native-snap-carousel';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import moment from 'moment';

import ScheduleCard from '../components/ScheduleCard';
import withHamburger from '../util/withHamburger';
import { bugsnag } from '../util/misc';
import { isScheduleEmpty } from '../util/querySchedule';
import { processFinalsOrAssembly } from '../util/processSchedule';
import { WIDTH, HEIGHT } from '../constants/constants';

const mapStateToProps = ({
  schedule, dayInfo, specialDates,
}) => ({
  schedule: processFinalsOrAssembly(schedule, dayInfo.hasAssembly, dayInfo.isFinals),
  dayInfo,
  specialDates,
});

@withHamburger
@connect(mapStateToProps)
export default class Schedule extends Component {
  renderItem = ({ item }) => <ScheduleCard content={item} {...this.props} />

  render() {
    bugsnag.leaveBreadcrumb('Rendering schedule');
    const { schedule } = this.props;
    // Monday is 0, Friday is 4
    const currentDay = moment().weekday();

    return (
      isScheduleEmpty(schedule)
        /* eslint-disable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
        ? <View style={styles.noSchedule}>
            <Text style={styles.noScheduleText}>
              There is no schedule to display. If the school year has started,
              try manually refreshing in Settings.
            </Text>
          </View>
        : <Carousel
            loop
            firstItem={Math.min(currentDay, 4)}
            data={schedule}
            renderItem={this.renderItem}
            sliderWidth={WIDTH}
            itemWidth={WIDTH * 0.8}
            containerCustomStyle={styles.container}
            contentContainerCustomStyle={styles.content}
          />
        /* eslint-enable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
    );
  }
}

Schedule.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="schedule" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = EStyleSheet.create({
  noSchedule: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noScheduleText: {
    fontFamily: '$fontLight',
    fontSize: 20,
    textAlign: 'center',
  },
  container: { flex: 1 },
  content: { marginTop: HEIGHT * 0.1 },
  icon: { fontSize: 20 },
});
