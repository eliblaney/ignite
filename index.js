import {AppRegistry} from "react-native";
import TrackPlayer from "react-native-track-player";
import App from "./App";
import {name as appName} from "./app.json";

// console.ignoredYellowBox = ['Require cycle'];
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => require("./src/PlaybackService.js"));
