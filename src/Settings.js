import React from 'react';
import {
  Alert,
  View
} from 'react-native';

import SettingsList from 'react-native-settings-list';

const Settings = () => (
  <View style={{backgroundColor:'white',flex:1}}>
    <View style={{flex:1, marginTop:50}}>
      <SettingsList>
        <SettingsList.Header headerText='First Grouping' headerStyle={{color:'gray'}}/>
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
        <SettingsList.Item
          title='Different Colors Example'
          backgroundColor='#D1D1D1'
          titleStyle={{color:'blue'}}
          arrowStyle={{tintColor:'blue'}}
          onPress={() => Alert.alert('Different Colors Example Pressed')}/>
        <SettingsList.Header headerText='Different Grouping' headerStyle={{color:'white', marginTop:50}}/>
        <SettingsList.Item titleInfo='Some Information' hasNavArrow={false} title='Information Example'/>
        <SettingsList.Item title='Settings 1'/>
        <SettingsList.Item title='Settings 2'/>
      </SettingsList>
    </View>
  </View>
);

export default Settings;
