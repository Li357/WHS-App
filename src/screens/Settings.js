import React, { Component } from 'react';
import { Alert, Switch, View, Text } from 'react-native';
import { List, ListItem, Radio, Right, Left, Body, Icon } from 'native-base';
import { CircleSnail } from 'react-native-progress';
import SortableListView from 'react-native-sortable-listview';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';

import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';
import { fetchUserInfo } from '../actions/actionCreators';

const mapStateToProps = ({ username, password, settings }) => ({
  username, password, settings,
});

const DraggableItem = ({ row: { text } }) => (
  <ListItem>
    <Body><Text>{text}</Text></Body>
    <Right><Radio selected={false} /></Right>
  </ListItem>
);

@waitForAnimation
@withHamburger
@connect(mapStateToProps)
export default class Settings extends Component {
  constructor(props) {
    super(props);

    this.duringModData = {
      CURRENTMOD: { text: 'Current mod' },
      UNTILMODENDS: { text: 'Until mod ends' },
      NEXTCLASS: { text: 'Next class' },
      UNTILDAYENDS: { text: 'Until day ends' },
    };
    this.duringPassingPeriodData = {
      UNTILPASSINGPERIODENDS: { text: 'Until passing period ends' },
      NEXTCLASS: { text: 'Next class' },
      UNTILDAYENDS: { text: 'Until day ends' },
    };

    const { settings: { errorReporting, dashboard } } = props;
    this.state = {
      refreshing: false,
      errorReporting,
      duringMod: dashboard.showDuringMod,
      duringPassingPeriod: dashboard.showDuringPassingPeriod,
      duringModOrder: Object.keys(this.duringModData),
      duringPassingPeriodOrder: Object.keys(this.duringPassingPeriodData),
    };
  }

  handleRefresh = async () => {
    this.setState({ refreshing: true });

    try {
      const { dispatch, username, password } = this.props;

      const success = await dispatch(fetchUserInfo(username, password));
      if (success) {
        Alert.alert(
          'Success', 'Your information was refreshed.',
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert(
          'Error', 'Something went wrong. Your login information may have changed.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      Alert.alert(
        'Error', `${error}`,
        [{ text: 'OK' }],
      );
      // TODO: Better error reporting
    }

    this.setState({ refreshing: false });
  }

  handleSwitch = (selected) => {
    this.setState({ errorReporting: selected });
  }

  saveSettings = () => {

  }

  handleRowChange = orderKey => (event) => {
    this.setState(prevState => {
      const copy = prevState[orderKey].slice();
      copy.splice(event.to, 0, copy.splice(event.from, 1)[0]);
      return { orderKey: copy };
    });
  }

  render() {
    const {
      refreshing,
      errorReporting,
      duringMod,
      duringPassingPeriod,
      duringModOrder,
      duringPassingPeriodOrder,
    } = this.state;

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
          <ListItem icon last>
            <Left><Icon type="MaterialIcons" name="warning" style={styles.errorReporting} /></Left>
            <Body><Text>Error Reporting</Text></Body>
            <Right><Switch value={errorReporting} onValueChange={this.handleSwitch} /></Right>
          </ListItem>
          <ListItem itemHeader>
            <Text style={styles.header}>Dashboard</Text>
          </ListItem>
          <SortableListView
            data={this.duringModData}
            order={duringModOrder}
            scrollEnabled={false}
            onRowMoved={this.handleRowChange('duringModOrder')}
            renderRow={row => <DraggableItem row={row} />}
          />
        </List>
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
  errorReporting: { fontSize: 25 },
});
