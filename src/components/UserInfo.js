import React, { Component } from 'react';
import { Alert, AsyncStorage, View, Text, Dimensions, StyleSheet } from 'react-native';
import PhotoUpload from 'react-native-photo-upload';
import { Thumbnail } from 'native-base';
import EStyleSheet from 'react-native-extended-stylesheet';

export default class UserInfo extends Component {
  saveProfilePhoto = async (newPhoto) => {
    try {
      const { username } = this.props;
      await AsyncStorage.setItem(`${username}:profilePhoto`, newPhoto);
    } catch (error) {
      Alert.alert(
        'Error', `${error}`,
        [{ text: 'OK' }],
      );
      // TODO: Alert error & better error reporting
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

const { width } = Dimensions.get('window');
const styles = EStyleSheet.create({
  $profilePhotoSize: width / 3,
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
