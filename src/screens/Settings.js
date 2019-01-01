import React, { Component } from 'react';
import {
  Alert, View, Text, TouchableOpacity,
} from 'react-native';
import {
  List, ListItem, Left, Body, Right, Icon,
} from 'native-base';
import Dialog from 'react-native-dialog';
import { CircleSnail } from 'react-native-progress';
import DraggableFlatList from 'react-native-draggable-flatlist';
import EStyleSheet from 'react-native-extended-stylesheet';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import withHamburger from '../components/withHamburger';
import { reportError, bugsnag } from '../util/misc';
import { fetchUserInfo, setOtherSchedules } from '../actions/actionCreators';

const mapStateToProps = (state, ownProps) => ({
  ...state, ...ownProps,
});

@withHamburger
@withNavigation
@connect(mapStateToProps)
export default class Settings extends Component {
  state = {
    refreshing: false,
    reportDialogVisible: false,
    bugReport: '',
  }

  handleRefresh = async () => {
    this.setState({ refreshing: true });

    try {
      const { dispatch, username, password } = this.props;

      bugsnag.leaveBreadcrumb('Refreshing user info');
      const success = await dispatch(fetchUserInfo(username, password));
      if (success) {
        Alert.alert(
          'Success',
          'Your information was refreshed.',
          [{ text: 'OK' }],
        );
      } else {
        reportError('Something went wrong while refreshing. Your login information may have changed.');
      }
    } catch (error) {
      reportError(
        'Something went wrong while refreshing. Please check your internet connection.',
        error,
      );
    }

    this.setState({ refreshing: false });
  }

  openDialog = () => {
    this.setState({ reportDialogVisible: true });
  }

  closeDialog = () => {
    this.setState({ reportDialogVisible: false });
  }

  handleReport = () => {
    this.closeDialog();
    bugsnag.notify(new Error(`Bug Report - ${this.state.bugReport}`));
  }

  handleInput = (text) => {
    this.setState({ bugReport: text });
  }

  onScheduleRowChange = ({ data }) => {
    this.props.dispatch(setOtherSchedules(data));
  }

  removeSchedule = (index) => {
    const { dispatch, otherSchedules } = this.props;
    dispatch(setOtherSchedules(otherSchedules.filter((_, i) => i !== index)));
  }

  renderScheduleRow = ({
    item: { name }, index, move, moveEnd,
  }) => (
    <ListItem>
      <Body>
        <TouchableOpacity onLongPress={move} onPressOut={moveEnd}>
          <Text>{name}</Text>
        </TouchableOpacity>
      </Body>
      <Right>
        <TouchableOpacity onPress={() => this.removeSchedule(index)}>
          <Icon type="MaterialIcons" name="close" />
        </TouchableOpacity>
      </Right>
    </ListItem>
  );

  render() {
    const { refreshing, reportDialogVisible, bugReport } = this.state;

    return (
      <View style={styles.container}>
        <List style={styles.list}>
          <ListItem itemHeader first>
            <Text style={styles.header}>General</Text>
          </ListItem>
          <ListItem icon onPress={this.handleRefresh} disabled={refreshing}>
            <Left>
              {
                refreshing
                  ? <CircleSnail color="black" size={25} />
                  : <Icon type="MaterialIcons" name="refresh" />
              }
            </Left>
            <Body><Text>Refresh Your Information</Text></Body>
          </ListItem>
          <ListItem icon last onPress={this.openDialog}>
            <Left><Icon type="MaterialIcons" name="error" style={{ fontSize: 25 }} /></Left>
            <Body><Text>Report Bug</Text></Body>
          </ListItem>
          <ListItem itemHeader>
            <Text style={styles.header}>Schedules</Text>
          </ListItem>
          <DraggableFlatList
            data={this.props.otherSchedules}
            onMoveEnd={this.onScheduleRowChange}
            keyExtractor={schedule => schedule.name}
            renderItem={this.renderScheduleRow}
          />
        </List>
        <Dialog.Container visible={reportDialogVisible}>
          <Dialog.Title>Report Bug</Dialog.Title>
          <Dialog.Description>Give a brief description of the bug</Dialog.Description>
          <Dialog.Input onChangeText={this.handleInput} value={bugReport} />
          <Dialog.Button onPress={this.closeDialog} label="Cancel" />
          <Dialog.Button onPress={this.handleReport} label="Report" />
        </Dialog.Container>
      </View>
    );
  }
}

Settings.navigationOptions = {
  drawerIcon: ({ tintColor }) => (
    <Icon type="MaterialIcons" name="settings" style={[styles.icon, { color: tintColor }]} />
  ),
};

const styles = EStyleSheet.create({
  icon: { fontSize: 20 },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  list: { height: '90%' },
  header: {
    fontFamily: '$fontRegular',
    color: 'rgba(0, 0, 0, 0.5)',
  },
});
