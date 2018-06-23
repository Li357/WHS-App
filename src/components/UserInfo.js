import React, { PureComponent } from 'react';
import { Alert, AsyncStorage, View, Text, StyleSheet } from 'react-native';
import PhotoUpload from 'react-native-photo-upload';
import { Thumbnail } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';

import { setProfilePhoto } from '../actions/actionCreators';
import { WIDTH, HEIGHT } from '../constants/constants';

@connect()
export default class UserInfo extends PureComponent {
  saveProfilePhoto = async (newPhoto, reset = false) => {
    if (newPhoto) {
      try {
        const { username, dispatch } = this.props;
        // Need to use templates because newPhoto is base64 encoded string when not resetting
        const photo = reset ? newPhoto : `data:image/jpeg;base64,${newPhoto}`;
        await AsyncStorage.setItem(`${username}:profilePhoto`, photo); // Set in AsyncStorage
        dispatch(setProfilePhoto(photo)); // Also set in state for current app session
      } catch (error) {
        Alert.alert(
          'Error', `${error}`,
          [{ text: 'OK' }],
        );
        // TODO: Alert error & better error reporting
      }
    }
  }

  handleReset = () => {
    const { schoolPicture } = this.props;
    this.saveProfilePhoto(schoolPicture, true);
  }

  render() {
    const { name, classOf, profilePhoto } = this.props;
    const profilePhotoObj = { uri: profilePhoto };
    const customButtons = [{ name: 'reset', title: 'Reset Photo' }];

    return (
      <View style={styles.studentProfile}>
        <PhotoUpload
          onPhotoSelect={this.saveProfilePhoto}
          customButtons={customButtons}
          onTapCustomButton={this.handleReset}
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
  $profilePhotoSize: HEIGHT / 5.5,
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
    fontSize: WIDTH / 15,
    fontFamily: '$fontRegular',
  },
  classOf: {
    textAlign: 'center',
    fontSize: WIDTH / 20,
    fontFamily: '$fontLight',
    marginBottom: '$studentInfoHeight - 32%',
  },
});
