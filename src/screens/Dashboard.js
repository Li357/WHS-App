import React, { Component } from 'react';
import { View, Image, Dimensions } from 'react-native';
import ParallaxScrollView from 'react-native-parallax-scroll-view';
import { Icon } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';

import UserInfo from '../components/UserInfo';
import UserBackground from '../components/UserBackground';
import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';

const mapStateToProps = ({
  loginError, schedule, dates, ...studentInfo
}) => ({
  ...studentInfo,
});
const { height, width } = Dimensions.get('window');

@waitForAnimation
@withHamburger
@connect(mapStateToProps)
export default class Dashboard extends Component {
  renderForeground = () => <UserInfo {...this.props} />
  renderBackground = () => <UserBackground {...this.props} />
  renderStickyHeader = () => {
    // TODO: Adjust header height for iPhone X
    const profilePhotoObj = { uri: this.props.schoolPicture };
    return (
      <View style={styles.header}>
        <Image source={profilePhotoObj} style={styles.headerImage} />
      </View>
    );
  }

  render() {
    // TODO: Refactor content of Dashboard into new component ScheduleInfo
    // This component will be presentational, with countdown logic
    // and mod calculations in this component
    return (
      <ParallaxScrollView
        backgroundColor="#c73436"
        parallaxHeaderHeight={height * 0.35}
        stickyHeaderHeight={height * 0.1}
        renderForeground={this.renderForeground}
        renderBackground={this.renderBackground}
        renderStickyHeader={this.renderStickyHeader}
        showsVerticalScrollIndicator={false}
      >
        {/* TODO: Content */}
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
  header: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerImage: {
    alignSelf: 'flex-end',
    width: '10%',
    height: width * 0.1,
    borderRadius: (width * 0.1) / 2,
    marginTop: '3%',
    right: '6%',
  },
  icon: { fontSize: 20 },
});
