import React, { Component } from 'react';
import { View, ImageBackground, Text, ScrollView } from 'react-native';
import { Container, Button, Icon } from 'native-base';
import { DrawerItems } from 'react-navigation';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';
import moment from 'moment';

import { logOut } from '../actions/actionCreators';
import { HEIGHT } from '../constants/constants';
import background from '../../assets/images/background.png';

const mapStateToProps = (state, ownProps) => ({
  ...state, ...ownProps,
});

@connect(mapStateToProps)
export default class DrawerContent extends Component {
  handleLogout = () => {
    const { dispatch, navigation: { navigate } } = this.props;
    navigate('Login');
    dispatch(logOut());
  }

  render() {
    const now = moment();
    const { otherSchedules } = this.props;

    return (
      <Container style={styles.container}>
        <View style={styles.imageContainer}>
          <ImageBackground source={background} style={styles.header}>
            <View style={styles.dateContainer}>
              <Text style={styles.weekday}>{now.format('dddd')}</Text>
              <Text style={styles.date}>{now.format('MMM D, YYYY')}</Text>
            </View>
          </ImageBackground>
        </View>
        <ScrollView>
          <DrawerItems {...this.props} itemsContainerStyle={styles.items} />
          <View style={styles.separator} />
          <Button iconLeft transparent onPress={this.handleLogout} style={styles.logout}>
            <Icon name="md-log-out" style={styles.icon} />
            <Text allowFontScaling style={styles.text}>Logout</Text>
          </Button>
        </ScrollView>
      </Container>
    );
  }
}

const styles = EStyleSheet.create({
  container: { flex: 1 },
  imageContainer: { height: '30%' },
  header: { height: '100%' },
  dateContainer: {
    position: 'absolute',
    bottom: '10%',
    left: '6%',
  },
  weekday: {
    fontSize: HEIGHT / 19,
    color: 'white',
    fontFamily: '$fontRegular',
  },
  date: {
    fontSize: HEIGHT / 21,
    color: 'white',
    fontFamily: '$fontLight',
  },
  items: { paddingVertical: 0 },
  separator: {
    marginHorizontal: 18,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
  },
  logout: {
    paddingHorizontal: 16,
    width: '100%',
    justifyContent: 'flex-start',
  },
  icon: {
    fontSize: 20,
    marginLeft: 0,
    marginRight: 20,
    paddingLeft: 4,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  text: {
    fontWeight: 'bold',
    marginHorizontal: 16,
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
