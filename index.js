import { AppRegistry } from 'react-native';
import App from './App';
import { YellowBox } from 'react-native';

YellowBox.ignoreWarnings(['Warning', 'Module', 'Required', 'RCTBridge']);
AppRegistry.registerComponent('WHS', () => App);
