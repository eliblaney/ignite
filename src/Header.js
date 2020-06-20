import React from 'react';
import { View, StyleSheet } from 'react-native';
import Colors from './Colors.js';
import { Header as ElementsHeader } from 'react-native-elements';

export default class Header extends React.Component {

	constructor(props) {
		super(props)
	}

	render() {
		return (
			<ElementsHeader
				barStyle="light-content"
				containerStyle={styles.header}
				centerComponent={{text: this.props.title, style: [styles.title, this.props.titleStyle]}}
				leftComponent={this.props.left}
				rightComponent={this.props.right}
			/>
		);
	}

};

const styles = StyleSheet.create({
	header: {
		backgroundColor: Colors.primary,
		justifyContent: 'space-around',
	},
	title: {
		fontSize: 24,
		color: Colors.primaryText,
	},
});
