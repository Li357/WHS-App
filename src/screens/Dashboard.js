import React, { Component } from 'react';
import { View, ScrollView, Text, Dimensions } from 'react-native';
import ReactNativeParallaxHeader from 'react-native-parallax-header';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import { withNavigation } from 'react-navigation';

import UserInfo from '../components/UserInfo';
import withHamburger from '../util/withHamburger';

const mapStateToProps = ({
  loginError, schedule, dates, ...studentInfo,
}) => ({
  ...studentInfo,
});

const { height } = Dimensions.get('window');

@withNavigation
@withHamburger
@connect(mapStateToProps)
export default class Dashboard extends Component {
  handleScroll = ({ nativeEvent: { contentOffset } }) => {
    console.log(contentOffset.y);
  }

  renderNavBar = () => {
    return <UserInfo {...this.props} />
  }

  renderContent = () => {
    return (
      <ScrollView onScroll={this.handleScroll} style={styles.scheduleInfo}>

      </ScrollView>
    );
  }

  render() {
    // TODO: Refactor ScrollView into new component ScheduleInfo
    // This component will be presentational, with countdown logic
    // and mod calculations in this component
    //
    // TODO: Fix this Parallax Header and hook it up to profile photo
    // and image resizing animation
    return (
      <ReactNativeParallaxHeader
        headerMinHeight={height * 0.1}
        headerMaxHeight={height * 0.35}
        renderNavBar={this.renderNavBar}
        renderContent={this.renderContent}
        extraScrollHeight={50}
      />
    );
  }
}

const styles = EStyleSheet.create({
  scheduleInfo: {
    //height: '65%',
    backgroundColor: 'white',
  },
});
