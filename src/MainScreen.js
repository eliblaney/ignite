import React from 'react';
import Colors from './Colors.js';

import Swiper from 'react-native-swiper'; /* Edits: Comment {dots}, make conditional at componentWillMount get both lines */
import Reflections from './Reflections.js';
import Community from './Community.js';
import Kindling from './Kindling.js';

import Reactotron from 'reactotron-react-native';

export default class MainScreen extends React.PureComponent {

	static navigationOptions = ({navigation}) => {
		return { headerShown: false }
	}

	constructor(props) {
		super(props);
	}

	render() {
		let community = (
					<Community reauth={this.props.reauth} uid={this.props.user.uid} community={this.props.community} currentDay={this.props.currentDay} daysUntil={this.props.daysUntil} startedAt={this.props.started ? this.props.startedAt : false} />
		);
		let kindling = (
					<Kindling uid={this.props.user.uid} />
		);
		let reflections = (
					<Reflections uid={this.props.user.uid} community={this.props.community} startedAt={this.props.started ? this.props.startedAt : false} />
		);

		if(this.props.age < 2) {
			// if it's their first time opening the app, show the
			// tutorial message on the reflections screen
			return (
				<Swiper style={{backgroundColor: Colors.background}}>
					{reflections}
					{community}
					{kindling}
				</Swiper>
			);
		} else {
			return (
				<Swiper>
					{community}
					{kindling}
					{reflections}
				</Swiper>
			);
		}
	}

};
