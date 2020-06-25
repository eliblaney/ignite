import React from 'react';

import { createAppContainer } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import AuthController from './src/AuthController.js';
import LoadingScreen from './src/LoadingScreen.js';
import MainScreen from './src/MainScreen.js';
import WordScreen from './src/WordScreen.js';
import JoinCommunityScreen from './src/JoinCommunityScreen.js';
import FirebaseLogin from './FirebaseLogin';
import { KindlingDetail, Suscipe, Account } from './src/Kindling.js';

import Reactotron from 'reactotron-react-native';

const __DEV__ = true;

if(__DEV__) {
	import('./config/ReactotronConfig').then(() => console.log("Reactotron configured."));
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
		},
		{
			// "Back" button label shown on submenues like suscipe
			initialRouteName: 'Back',
		}
	)
);

const App = () => {
	return (
		<AppContainer />
	);
};

export default App;
