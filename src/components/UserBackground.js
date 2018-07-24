import React from 'react';
import { Image, View, StyleSheet, Platform } from 'react-native';

import blankUser from '../../assets/images/blank-user.png';

const UserBackground = ({ profilePhoto }) => (
  <View style={styles.blurContainer}>
    <Image
      blurRadius={Platform.OS === 'ios' ? 5 : 1}
      source={profilePhoto === 'blank-user' ? blankUser : { uri: profilePhoto }}
      onLoadEnd={this.handleImageLoad}
      style={styles.blur}
    />
  </View>
);
export default UserBackground;

const styles = StyleSheet.create({
  blurContainer: {
    width: '100%',
    height: '100%',
  },
  blur: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});
