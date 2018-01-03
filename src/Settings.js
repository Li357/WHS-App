import React, { Component } from 'react';
import {
  Alert,
  AsyncStorage,
  Dimensions,
  Image,
  Text,
  View
} from 'react-native';

import { connect } from 'react-redux';
import {
  fetchUserInfo,
  logOut,
  setProfilePhoto
} from './actions/actionCreators.js';

import EStyleSheet from 'react-native-extended-stylesheet';
import SettingsList from 'react-native-settings-list';

import HamburgerMenu from './HamburgerMenu.js';
import Loading from '../assets/images/loading.gif';

class Settings extends Component {
  state = {
    refreshLoading: false
  }

  handleClearStorage = (dispatch, id) => {
    const clearStorage = () => {
      try {
        AsyncStorage.getAllKeys(async (error, keys) => {
          if(error) {
            throw error;
          }
          await AsyncStorage.multiRemove(
            keys.filter(key =>
              key.includes('profilePhoto')
            ),
            () => {
              dispatch(setProfilePhoto(`https://westsidestorage.blob.core.windows.net/student-pictures/${id}.jpg`))
            }
          );
        });
      } catch(error) {
        Alert.alert(
          'Error',
          `An error occurred: ${error}`,
          [
            { text: 'OK' }
          ]
        );
      }
    }

    Alert.alert(
      'Confirm',
      'This will clear all profile pictures on this phone. Note that profile pictures are not set on the school website but are local to your phone.',
      [
        {
          text: 'Clear',
          onPress: clearStorage
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  }

  handleRefresh = async (dispatch, username, password, error, navigation) => {
    if(!this.state.refreshLoading) {
      this.setState({
        refreshLoading: true
      });
      try {
        await dispatch(fetchUserInfo(username, password, true));

        const logout = () => {
          dispatch(logOut());
          navigate('Login');
        }

        if(error.trim()) {
          Alert.alert(
            'Error',
            'An error occurred while logging in. Your username and/or password may have changed. Please login.',
            [
              {
                text: 'OK',
                onPress: logout
              }
            ]
          );
        } else {
          Alert.alert(
            'Notice',
            'Your schedule and information has successfully been refreshed.',
            [
              {
                text: 'OK'
              }
            ]
          );
        }
      } catch(error) {
        Alert.alert(
          'Error',
          `An error occurred: ${error}`,
          [
            { text: 'OK' }
          ]
        );
      }
      this.setState({
        refreshLoading: false
      });
    }
  }

  render() {
    const {
      navigation,
      dispatch,
      username,
      password,
      id,
      error
    } = this.props;

    const {
      refreshLoading,
      clearLoading
    } = this.state;

    const LoadingGIF = <Image source={Loading} style={styles._loadingIcon} />

    return (
      <View style={styles._settingsContainer}>
        <HamburgerMenu navigation={navigation} />
        <View style={styles._settingsLists}>
          <SettingsList borderColor='#c8c7cc' scrollViewProps={{ scrollEnabled: false }}>
            <SettingsList.Item
              arrowIcon={refreshLoading && LoadingGIF}
              hasNavArrow={false}
              title="Manual Refresh"
              onPress={() => !refreshLoading && this.handleRefresh(dispatch, username, password, error, navigation)}
            />
            <SettingsList.Item
              hasNavArrow={false}
              title="Clear Storage"
              onPress={() => !clearLoading && this.handleClearStorage(dispatch, id)}
            />
          </SettingsList>
          <Text style={styles._settingsDescription}>
            If your schedule changed during the semester, manually refresh to update it. Your schedule only automatically refreshes at the beginning of every semester.
          </Text>
        </View>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  settingsContainer: {
    backgroundColor: 'white',
    flex: 1
  },
  settingsLists: {
    flex: 1,
    marginTop: Dimensions.get('window').height === 812 ? 90 : 80
  },
  settingsDescription: {
    color: 'gray',
    position: 'absolute',
    top: 100,
    margin: 15
  },
  loadingIcon: {
    width: 25,
    height: 25,
    top: 25 / 2,
    right: 25 / 2
  }
});

const mapStateToProps = ({
  username,
  password,
  id,
  error
}) => ({
  username,
  password,
  id,
  error
});

export default connect(mapStateToProps)(Settings);
