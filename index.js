import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';

//console.ignoredYellowBox = ['Require cycle'];
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => require('./src/PlaybackService.js'));
