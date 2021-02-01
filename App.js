import React from "react";

import {createAppContainer} from "react-navigation";
import {createStackNavigator} from "react-navigation-stack";

import AuthController from "./src/AuthController";
import LoadingScreen from "./src/LoadingScreen";
import MainScreen from "./src/MainScreen";
import WordScreen from "./src/WordScreen";
import JoinCommunityScreen from "./src/JoinCommunityScreen";
import FirebaseLogin from "./FirebaseLogin";
import KindlingDetail from "./src/KindlingDetail";
import Account from "./src/settings/Account";
import Suscipe from "./src/settings/Suscipe";
import Contact from "./src/settings/Contact";

const __DEV__ = true;

if (__DEV__) {
  import("./config/ReactotronConfig").then(() =>
    console.log("Reactotron configured.")
  );
}

const AppContainer = createAppContainer(
  createStackNavigator(
    {
      Back: AuthController,
      loading: LoadingScreen,
      main: MainScreen,
      word: WordScreen,
      join: JoinCommunityScreen,
      login: FirebaseLogin,
      kindling: KindlingDetail,
      suscipe: Suscipe,
      account: Account,
      contact: Contact,
    },
    {
      // "Back" button label shown on submenues like suscipe
      initialRouteName: "Back",
    }
  )
);

const App = () => {
  return <AppContainer />;
};

export default App;
