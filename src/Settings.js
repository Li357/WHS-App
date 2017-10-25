import React from 'react';
import {
  Alert,
  AsyncStorage,
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

const handleClearStorage = (dispatch, id) => {
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

const handleRefresh = async (dispatch, username, password, error, navigation) => {
  try {
    await dispatch(fetchUserInfo(username, password, true));

    const logout = () => {
      dispatch(logOut());
      navigate('Login');
    }

    if(error.trim()) {
      Alert.alert(
        'Error',
        'An error occurred while logging in. Your username and/or password may have changed. Please try again.',
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
}

const Settings = ({
  navigation,
  dispatch,
  username,
  password,
  id,
  error
}) => (
  <View style={styles._settingsContainer}>
    <HamburgerMenu navigation={navigation} />
    <View style={styles._settingsLists}>
      <SettingsList borderColor='#c8c7cc'>
        <SettingsList.Item
          hasNavArrow={false}
          title="Manual Refresh"
          onPress={() => handleRefresh(dispatch, username, password, error, navigation)}
        />
        <SettingsList.Item
          hasNavArrow={false}
          title="Clear Storage"
          onPress={() => handleClearStorage(dispatch, id)}
        />
      </SettingsList>
      <Text style={styles._credit}>Created by Andrew Li, MIT License.</Text>
    </View>
  </View>
);

const styles = EStyleSheet.create({
  settingsContainer: {
    backgroundColor: 'white',
    flex: 1
  },
  settingsLists: {
    flex: 1,
    marginTop: 80
  },
  credit: {
    color: 'gray',
    margin: 10
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
