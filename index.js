import './reactotron';

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';

import 'react-native-gesture-handler';
import 'react-native-get-random-values';

import App from './App';

AppRegistry.registerComponent(appName, () => App);
