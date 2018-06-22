import React, { PureComponent } from 'react';
import { Alert, AsyncStorage, View, Text, StyleSheet } from 'react-native';
import PhotoUpload from 'react-native-photo-upload';
import { Thumbnail } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';

import { setProfilePhoto } from '../actions/actionCreators';
import { WIDTH } from '../constants/constants';

@connect()
export default class UserInfo extends PureComponent {
  saveProfilePhoto = async (newPhoto) => {
    if (newPhoto) {
      try {
        const { username, dispatch } = this.props;
        const base64 = `data:image/jpeg;base64,${newPhoto}`; // newPhoto is a base64 encoded image
        await AsyncStorage.setItem(`${username}:profilePhoto`, base64); // Set in AsyncStorage
        dispatch(setProfilePhoto(base64)); // Also set in state for current app session
      } catch (error) {
        Alert.alert(
          'Error', `${error}`,
          [{ text: 'OK' }],
        );
        // TODO: Alert error & better error reporting
      }
    }
  }

  render() {
    const { name, classOf, profilePhoto } = this.props;
    const profilePhotoObj = { uri: profilePhoto };

    return (
      <View style={styles.studentProfile}>
        <PhotoUpload
          onPhotoSelect={this.saveProfilePhoto}
          containerStyle={StyleSheet.flatten(styles.photoUploader)}
        >
          <Thumbnail source={profilePhotoObj} style={styles.profilePhoto} />
        </PhotoUpload>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.classOf}>{classOf}</Text>
      </View>
    );
  }
}

const styles = EStyleSheet.create({
  $profilePhotoSize: WIDTH / 3,
  $studentInfoHeight: '35%',
  studentProfile: {
    width: '100%',
    height: '100%',
  },
  photoUploader: {
    marginTop: '$studentInfoHeight - 32%',
  },
  profilePhoto: {
    width: '$profilePhotoSize',
    height: '$profilePhotoSize',
    borderRadius: '$profilePhotoSize / 2',
  },
  name: {
    textAlign: 'center',
    fontSize: 25,
    fontFamily: '$fontRegular',
  },
  classOf: {
    textAlign: 'center',
    fontSize: 17,
    fontFamily: '$fontRegular',
    marginBottom: '$studentInfoHeight - 32%',
  },
});
