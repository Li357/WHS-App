import React, { Component } from 'react';
import { View, Image, Text } from 'react-native';
import { Container, Button, Icon } from 'native-base';
import { DrawerItems, withNavigation } from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import moment from 'moment';

import { logOut } from '../actions/actionCreators';
import background from '../../assets/images/background.png';

const mapStateToProps = (state, ownProps) => ({
  ...state,
  ...ownProps,
});

@withNavigation
@connect(mapStateToProps)
export default class DrawerContent extends Component {
  handleLogout = () => {
    const { dispatch, navigation } = this.props;
    navigation.navigate('Login');
    dispatch(logOut());
  }

  render() {
    const now = moment();

    return (
      <Container style={styles.container}>
        <Image source={background} style={styles.header} />
        <View style={styles.dateContainer}>
          <Text style={styles.weekday}>{now.format('dddd')}</Text>
          <Text style={styles.date}>{now.format('MMM D, YYYY')}</Text>
        </View>
        <DrawerItems {...this.props} />
        <View style={styles.separator} />
        <Button iconLeft transparent onPress={this.handleLogout} style={styles.logout}>
          <Icon name="md-log-out" style={styles.icon} />
          <Text allowFontScaling style={styles.text}>Logout</Text>
        </Button>
      </Container>
    );
  }
}

const styles = EStyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignSelf: 'stretch',
    width: null,
    position: 'relative',
    height: '30%',
  },
  dateContainer: {
    position: 'absolute',
    top: '16%',
    left: '6%',
  },
  weekday: {
    fontSize: 30,
    color: 'white',
    fontFamily: '$fontRegular',
  },
  date: {
    fontSize: 35,
    color: 'white',
    fontFamily: '$fontLight',
  },
  separator: {
    marginHorizontal: 18,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
  },
  logout: {
    marginHorizontal: 16,
  },
  icon: {
    fontSize: 20,
    marginLeft: 0,
    marginRight: 20,
    paddingLeft: 4,
    color: 'rgba(0, 0, 0, 0.4)',
  },
  text: {
    fontWeight: 'bold',
    marginHorizontal: 16,
    color: 'rgba(0, 0, 0, 0.4)',
  },
});
