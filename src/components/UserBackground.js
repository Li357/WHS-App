import React, { PureComponent } from 'react';
import { Image, View, findNodeHandle, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'react-native-blur';

export default class UserBackground extends PureComponent {
  state = { blurRef: null }

  handleImageLoad = () => {
    this.setState({ blurRef: findNodeHandle(this.backgroundImage) });
  }

  render() {
    const { blurRef } = this.state;
    const profilePhotoObj = { uri: this.props.profilePhoto };

    return (
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
          blurAmount={10}
          style={styles.blur}
        />
      </View>
    );
  }
}

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
