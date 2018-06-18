import React, { Component } from 'react';
import { View, ScrollView, Text } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Container } from 'native-base';
import { connect } from 'react-redux';

import UserInfo from '../components/UserInfo';

const mapStateToProps = ({
  loginError, schedule, dates, ...studentInfo,
}) => ({
  ...studentInfo,
});

@connect(mapStateToProps)
export default class Dashboard extends Component {
  handleScroll = ({ nativeEvent: { contentOffset } }) => {
    console.log(contentOffset.y);
  }

  render() {
    // TODO: Refactor ScrollView into new component ScheduleInfo
    // This component will be presentational, with countdown logic
    // and mod calculations in this component
    return (
      <Container style={styles.container}>
        <UserInfo {...this.props} />
        <ScrollView onScroll={this.handleScroll} style={styles.scheduleInfo}>

        </ScrollView>
      </Container>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  scheduleInfo: {
    height: '65%',
    backgroundColor: 'white',
  },
});
