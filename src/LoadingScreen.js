import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from './Colors.js';

export default class LoadingScreen extends React.Component {

	static navigationOptions = ({navigation}) => {
		return { headerShown: false }
	}

	render() {
		return (
			<View style={styles.container}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: Colors.background,
	},
});
