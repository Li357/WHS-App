import React from 'react';
import {
  Alert,
  AsyncStorage,
  Text,
  View
} from 'react-native';

import { connect } from 'react-redux';
import { setProfilePhoto } from './actions/actionCreators.js';

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
      Alert.alert('Error', `An error occurred: ${error}`);
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

const Settings = ({ navigation, dispatch, id }) => (
  <View style={styles._settingsContainer}>
    <HamburgerMenu navigation={navigation} />
    <View style={styles._settingsLists}>
      <SettingsList borderColor='#c8c7cc'>
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

const mapStateToProps = ({ id }) => ({
  id
});

export default connect(mapStateToProps)(Settings);
