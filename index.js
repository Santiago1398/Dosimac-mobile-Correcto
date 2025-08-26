/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import {App} from './App';
import {App2} from './App2';
import {App3} from './src/App3';
import {name as appName} from './app.json';
import './src/localization/i18n';

AppRegistry.registerComponent(appName, () => App3);
