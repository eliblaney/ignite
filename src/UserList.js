import React from 'react';
import { StyleSheet } from 'react-native';
import Colors from './Colors.js';
import { Card, ListItem, Avatar } from 'react-native-elements';

export default class UserList extends React.Component {

	constructor(props) {
		super(props);
	}

	initials = (name) => {
		if(name.length < 2) {
			return name[0].toUppercase();
		}
		return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
	}

	render() {
		return (
			<Card containerStyle={[{backgroundColor: Colors.modalBackground}, this.props.style]}
				wrapperStyle={{backgroundColor: Colors.modalBackground}}
				title={this.props.title}
				titleStyle={{color: Colors.modalText}}>
			{this.props.users.map((u, i) => {
				let word = u.word !== undefined && u.word !== null ? "is feeling " + u.word.substring(u.word.indexOf("|") + 1) : null;
				return (
					<ListItem
						key={i}
						roundAvatar
						title={u.name}
						leftAvatar={<Avatar rounded title={this.initials(u.name)} overlayContainerStyle={styles.avatar} />}
						containerStyle={{backgroundColor: Colors.modalBackground}}
						titleStyle={{color: Colors.modalText}}
						subtitle={word}
						subtitleStyle={{color: Colors.fadedText, fontSize: 12}}
					/>
				);
			})}
			</Card>
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
	avatar: {
		backgroundColor: Colors.primary,
	},
});
