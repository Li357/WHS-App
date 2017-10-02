import React from 'react';
import {
  Alert,
  View
} from 'react-native';

import EStyleSheet from 'react-native-extended-stylesheet';
import SettingsList from 'react-native-settings-list';

import HamburgerMenu from './HamburgerMenu.js';

const Settings = ({ navigation }) => (
  <View style={styles._settingsContainer}>
    <HamburgerMenu navigation={navigation} />
    <View style={styles._settingsLists}>
      <SettingsList>
        <SettingsList.Header headerText='General' headerStyle={styles._headerStyle} />
        <SettingsList.Item
          itemWidth={50}
          title='Icon Example'
          onPress={() => Alert.alert('Icon Example Pressed')}
        />
        <SettingsList.Item
          hasNavArrow={false}
          switchState={true}
          hasSwitch={true}
          title='Switch Example'/>
      </SettingsList>
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
  headerStyle: {
    color: 'lightgray',
    marginLeft: 10
  }
});

export default Settings;
