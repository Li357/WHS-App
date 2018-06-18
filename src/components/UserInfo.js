import React, { Component } from 'react';
import {
  AsyncStorage,
  Alert,
  Dimensions,
  Image,
  Text,
  View,
  findNodeHandle,
  StyleSheet,
} from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Thumbnail } from 'native-base';
import PhotoUpload from 'react-native-photo-upload';
import { BlurView } from 'react-native-blur';

export default class UserInfo extends Component {
  state = { blurRef: null }

  handleImageLoad = () => {
    this.setState({ blurRef: findNodeHandle(this.backgroundImage) });
  }

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
    // TODO: Reset back to school picture
    const {
      name, classOf, schoolPicture, profilePhoto,
    } = this.props;
    const { blurRef } = this.state;
    const profilePhotoObj = { uri: profilePhoto };

    return (
      <View style={styles.studentInfo}>
        <View style={styles.blurContainer}>
          <Image
            ref={(img) => { this.backgroundImage = img; }}
            source={profilePhotoObj}
            onLoadEnd={this.handleImageLoad}
            style={styles.blur}
          />
          <BlurView
            viewRef={blurRef}
            blurType="light"
            blurAmount={5}
            style={styles.blur}
          />
        </View>
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
      </View>
    );
  }
}

const { width } = Dimensions.get('window');
const styles = EStyleSheet.create({
  $profilePhotoSize: width / 3,
  $studentInfoHeight: '35%',
  studentInfo: {
    height: '$studentInfoHeight',
  },
  blurContainer: {
    width: '100%',
    height: '100%',
  },
  blur: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  studentProfile: {
    position: 'absolute',
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
  },
  classOf: {
    textAlign: 'center',
    fontSize: 17,
    marginBottom: '$studentInfoHeight - 32%',
  },
});
