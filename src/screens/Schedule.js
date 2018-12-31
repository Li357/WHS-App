import React, { Component } from 'react';
import { Text, View, InteractionManager } from 'react-native';
import { Icon } from 'native-base';
import { withNavigation } from 'react-navigation';
import Carousel from 'react-native-snap-carousel';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import moment from 'moment';

import ScheduleCard from '../components/ScheduleCard';
import withHamburger from '../util/withHamburger';
import { bugsnag, selectProps } from '../util/misc';
import { isScheduleEmpty } from '../util/querySchedule';
import { processFinalsOrAssembly } from '../util/processSchedule';
import { WIDTH, HEIGHT } from '../constants/constants';
import { CircleSnail } from 'react-native-progress';

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

    return (
      <View style={styles.noSchedule}>
        {
          transitioned
            ? isScheduleEmpty(processedSchedule)
                /* eslint-disable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
                ? <Text style={styles.noScheduleText}>
                    There is no schedule to display. If the school year has started,
                    try manually refreshing in Settings.
                  </Text>
                : <>
                    <Text>{name}</Text>
                    <Carousel
                      loop
                      firstItem={Math.min(currentDay, 4)}
                      data={this.state.processedSchedule}
                      renderItem={this.renderItem}
                      sliderWidth={WIDTH}
                      itemWidth={WIDTH * 0.8}
                      containerCustomStyle={styles.container}
                      contentContainerCustomStyle={styles.content}
                    />
                  </>
                /* eslint-enable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
            : <CircleSnail size={50} indeterminate />
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
