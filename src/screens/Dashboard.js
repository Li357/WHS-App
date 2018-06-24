import React, { Component } from 'react';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { Icon } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';

import UserInfo from '../components/UserInfo';
import UserBackground from '../components/UserBackground';
import DashboardBlock from '../components/DashboardBlock';
import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';
import { HEIGHT } from '../constants/constants';

const mapStateToProps = ({
  loginError, schedule, dates, ...studentInfo
}) => ({
  ...studentInfo,
});

@waitForAnimation
@withHamburger
@connect(mapStateToProps)
export default class Dashboard extends Component {
  state = { info: [] }

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
