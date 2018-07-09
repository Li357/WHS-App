import React, { Component } from 'react';
import { AppState, Alert, Switch, View, Text } from 'react-native';
import { List, ListItem, Right, Left, Body, Icon } from 'native-base';
import { CircleSnail } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import waitForAnimation from '../util/waitForAnimation';
import withHamburger from '../util/withHamburger';
import reportError from '../util/reportError';
import { fetchUserInfo, setSettings } from '../actions/actionCreators';

const mapStateToProps = (state, ownProps) => ({
  ...state, ...ownProps,
});

@waitForAnimation
@withHamburger
@withNavigation
@connect(mapStateToProps)
export default class Settings extends Component {
  constructor(props) {
    super(props);

    const { navigation, settings: { errorReporting } } = props;
    this.blurSubscriber = navigation.addListener('willBlur', this.saveSettings);
    AppState.addEventListener('change', this.saveSettings);
    this.state = {
      refreshing: false,
      errorReporting,
    };
  }

  componentWillUnmount() {
    this.blurSubscriber.remove();
    AppState.removeEventListener('change', this.saveSettings);
  }

  handleRefresh = async () => {
    this.setState({ refreshing: true });

    try {
      const { dispatch, username, password } = this.props;

      const success = await dispatch(fetchUserInfo(username, password));
      if (success) {
        Alert.alert(
          'Success',
          'Your information was refreshed.',
          [{ text: 'OK' }],
        );
      } else {
        Alert.alert(
          'Error',
          'Something went wrong while refreshing. Your login information may have changed.',
          [{ text: 'OK' }],
        );
      }
    } catch (error) {
      const { dispatch, settings: { errorReporting } } = this.props;
      reportError(
        'Something went wrong while refreshing. Please check your internet connection.',
        error, errorReporting, dispatch, this.props,
      );
    }

    this.setState({ refreshing: false });
  }

  handleSwitch = (selected) => {
    this.setState({ errorReporting: selected });
  }

  saveSettings = (newStatus = 'inactive') => {
    if (newStatus === 'inactive') {
      const { refreshing, ...settings } = this.state;
      this.props.dispatch(setSettings(settings));
    }
  }

  render() {
    const { refreshing, errorReporting } = this.state;

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
