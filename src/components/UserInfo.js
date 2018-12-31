import React, { PureComponent } from 'react';
import {
  AsyncStorage, View, Text, StyleSheet,
} from 'react-native';
import PhotoUpload from 'react-native-photo-upload';
import { Thumbnail } from 'native-base';
import Carousel from 'react-native-looped-carousel';
import EStyleSheet from 'react-native-extended-stylesheet';
import { connect } from 'react-redux';

import { reportError, selectProps } from '../util/misc';
import { setProfilePhoto } from '../actions/actionCreators';
import { WIDTH, HEIGHT } from '../constants/constants';
import blankUser from '../../assets/images/blank-user.png';

const mapStateToProps = selectProps(
  'username', 'name',
  'profilePhoto', 'schoolPicture',
  'counselor', 'homeroom', 'dean', 'id',
  'isTeacher',
);

@connect(mapStateToProps)
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
        reportError(
          'Something went wrong while saving your profile photo. Please try again.',
          error,
        );
      }
    }
  }

  handleReset = () => {
    const { schoolPicture } = this.props;
    this.saveProfilePhoto(schoolPicture, true);
  }

  renderForeground = () => {
    const { name, classOf, profilePhoto } = this.props;
    const profilePhotoObj = profilePhoto === 'blank-user' ? blankUser : { uri: profilePhoto };
    const customButtons = [{ name: 'reset', title: 'Reset Photo' }];

    return (
      <View style={styles.slide}>
        <PhotoUpload
          onPhotoSelect={this.saveProfilePhoto}
          imagePickerProps={{ customButtons }}
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

  render() {
    const {
      counselor, homeroom, dean, id, isTeacher,
    } = this.props;
    const userInfo = [dean, counselor, homeroom, id];

    return (
      <View style={styles.studentProfile}>
        {
          !isTeacher
            /* eslint-disable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
            ? (
              <Carousel
                autoplay={false}
                bullets
                style={styles.studentProfile}
                bulletStyle={styles.bullet}
                chosenBulletStyle={styles.bullet}
                bulletsContainerStyle={styles.bulletsContainer}
              >
                {this.renderForeground()}
                <View style={styles.infoSlide}>
                  <View style={styles.infoLeft}>
                    {
                      ['Dean', 'Counselor', 'Homeroom', 'ID'].map(key => (
                        <Text key={key} style={styles.keyText}>{key}</Text>
                      ))
                    }
                  </View>
                  <View style={styles.separator} />
                  <View style={styles.infoRight}>
                    {
                      userInfo.map((value, index) => (
                        <Text key={value || index} style={styles.valueText}>
                          {value || 'N/A'}
                        </Text>
                      ))
                    }
                  </View>
                </View>
              </Carousel>
            )
            : this.renderForeground()
            /* eslint-enable react/jsx-indent-props, react/jsx-closing-bracket-location, react/jsx-indent, indent */
        }
      </View>
    );
  }
}

const slide = {
  width: WIDTH,
  height: '100%',
  alignItems: 'center',
  justifyContent: 'center',
};
const styles = EStyleSheet.create({
  $profilePhotoSize: HEIGHT / 5.5,
  $studentInfoHeight: '35%',
  $bulletSize: 8,
  studentProfile: {
    width: '100%',
    height: '100%',
  },
  slide,
  infoSlide: {
    ...slide,
    flexDirection: 'row',
  },
  bulletsContainer: {
    bottom: 0,
    height: 25,
  },
  bullet: {
    margin: 2.5,
    marginHorizontal: 5,
    width: '$bulletSize',
    height: '$bulletSize',
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
  infoLeft: { alignItems: 'flex-end' },
  separator: {
    borderWidth: 0.5,
    borderColor: 'black',
    height: '40%',
    marginHorizontal: 10,
  },
  keyText: {
    fontFamily: '$fontBold',
    fontSize: 15,
    lineHeight: 20,
  },
  valueText: {
    fontFamily: '$fontRegular',
    fontSize: 15,
  },
});
