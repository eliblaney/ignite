import {AppRegistry} from "react-native";
import App from "./App";
import {name as appName} from "./app.json";

// console.ignoredYellowBox = ['Require cycle'];
console.disableYellowBox = true;

AppRegistry.registerComponent(appName, () => App);
