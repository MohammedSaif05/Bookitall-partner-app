/**
 * @format
 */

import './global.css';
import { AppRegistry } from 'react-native';
import RNBootSplash from 'react-native-bootsplash';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// Hide native splash screen after React Native is registered
// Use setTimeout to ensure React Native bridge is ready
setTimeout(() => {
  RNBootSplash.hide({ fade: false }).catch(() => {});
}, 0);

// Additional attempts to ensure it hides
setTimeout(() => {
  RNBootSplash.hide({ fade: false }).catch(() => {});
}, 50);
