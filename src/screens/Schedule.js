import React, { Component } from 'react';
import { Text, View, InteractionManager } from 'react-native';
import { Icon } from 'native-base';
import { withNavigation } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import { CircleSnail } from 'react-native-progress';
import moment from 'moment';

import ScheduleCard from '../components/ScheduleCard';
import withHamburger from '../util/withHamburger';
import { bugsnag, selectProps } from '../util/misc';
import { isScheduleEmpty } from '../util/querySchedule';
import { processFinalsOrAssembly } from '../util/processSchedule';
import { WIDTH, HEIGHT } from '../constants/constants';

const mapStateToProps = selectProps('dayInfo', 'schedule', 'specialDates');

@withHamburger
@withNavigation
@connect(mapStateToProps)
export default class Schedule extends Component {
  state = {
    transitioned: false,
    processedSchedule: [],
    name: '',
  }

  constructor(props) {
    super(props);

    InteractionManager.runAfterInteractions(() => {
      const { schedule, dayInfo: { hasAssembly, isFinals }, navigation } = this.props;
      const scheduleParam = navigation.getParam('schedule', schedule);
      const nameParam = navigation.getParam('name', '');

      this.setState({
        transitioned: true,
        processedSchedule: processFinalsOrAssembly(scheduleParam, hasAssembly, isFinals),
        name: nameParam,
      });
    });
  }

  renderItem = ({ item }) => <ScheduleCard content={item} {...this.props} />

  render() {
    bugsnag.leaveBreadcrumb('Rendering schedule');

    // Monday is 0, Friday is 4
    const currentDay = moment().weekday();
    const { processedSchedule, name, transitioned } = this.state;

    if (!transitioned) {
      return (
        <View style={styles.scheduleContainer}>
          <CircleSnail size={50} indeterminate />
        </View>
      );
    }

    return (
      <View style={styles.scheduleContainer}>
        {
          isScheduleEmpty(processedSchedule)
            /* eslint-disable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
            ? (
              <Text style={styles.noScheduleText}>
                There is no schedule to display. If the school year has started,
                try manually refreshing in Settings.
              </Text>
            )
            : (
              <>
                <Text style={styles.scheduleName}>{name}</Text>
                <Carousel
                  loop
                  firstItem={Math.min(currentDay, 4)}
                  data={processedSchedule}
                  renderItem={this.renderItem}
                  sliderWidth={WIDTH}
                  itemWidth={WIDTH * 0.8}
                  containerCustomStyle={styles.container}
                />
              </>
            )
              /* eslint-enable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
        }
      </View>
    );
  }
}

Schedule.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="schedule" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = EStyleSheet.create({
  scheduleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scheduleName: {
    fontSize: 20,
    fontFamily: '$fontRegular',
    textAlign: 'center',
    marginTop: HEIGHT * 0.075,
    marginBottom: HEIGHT * 0.025
  },
  noScheduleText: {
    fontFamily: '$fontLight',
    fontSize: 20,
    textAlign: 'center',
  },
  container: { flex: 1 },
  icon: { fontSize: 20 },
});
