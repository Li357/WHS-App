import React, { Component } from 'react';
import { Alert, View, Text } from 'react-native';
import { List, ListItem, Left, Body, Icon } from 'native-base';
import { CircleSnail } from 'react-native-progress';
import EStyleSheet from 'react-native-extended-stylesheet';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';

import withHamburger from '../util/withHamburger';
import { reportError, bugsnag } from '../util/misc';
import { fetchUserInfo } from '../actions/actionCreators';

const mapStateToProps = (state, ownProps) => ({
  ...state, ...ownProps,
});

@withHamburger
@withNavigation
@connect(mapStateToProps)
export default class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = { refreshing: false };
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

  render() {
    const { refreshing } = this.state;

    return (
      <View style={styles.container}>
        <List style={styles.list}>
          <ListItem itemHeader first>
            <Text style={styles.header}>General</Text>
          </ListItem>
          <ListItem icon last onPress={this.handleRefresh} disabled={refreshing}>
            <Left>
              {
                refreshing
                  ? <CircleSnail color="black" size={25} />
                : <Icon type="MaterialIcons" name="refresh" />
              }
            </Left>
            <Body><Text>Refresh Your Information</Text></Body>
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
});
