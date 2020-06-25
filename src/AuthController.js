import React from 'react';
import auth from '@react-native-firebase/auth';
import IgniteHelper from './IgniteHelper.js';

import JoinCommunityScreen from './JoinCommunityScreen'
import FirebaseLogin from '../FirebaseLogin';
import LoadingScreen from './LoadingScreen.js';
import MainScreen from './MainScreen.js';
import WordScreen from './WordScreen.js';

import Reactotron from 'reactotron-react-native';

export default class AuthController extends React.Component {

	static navigationOptions = ({navigation}) => {
		return { headerShown: false }
	}

	constructor(props) {
		super(props);
		this.helper = new IgniteHelper();

		this.today = new Date();
		this.today.setHours(0);
		this.today.setMinutes(0);
		this.today.setSeconds(0);
		this.today.setMilliseconds(0);

		this.state = { loading: true, auth: false, user: null, word: null, currentDay: null, daysUntil: null, startedAt: false };
	}

	reauth = () => {
		// This is called when the retreat start date changes
		// and on logout for a fresh perspective
		this.logout();
		this.componentDidMount();
	}

	logout = () => {
		this.setState({ loading: true, auth: false, user: null, word: null, currentDay: null, daysUntil: null, startedAt: false });
	}

	componentDidMount() {
		// entry -> is logged in?
		auth().onAuthStateChanged(async user => {
			if(user !== undefined && user !== null) {
				await this.setState({...this.state, auth: true, user: user});
				this.checkCommunity(user.uid);
			} else {
				this.setState({...this.state, loading: false, auth: false, user: null});
			}
		});
	}

	onAuth = async (user) => {
		this.props.navigation.pop()
		// User has succesfully logged in or registered
		this.setState({...this.state, loading: true, auth: true, user: user});

		await this.checkCommunity(user.uid);
		this.forceUpdate();
	};

	signOutUser = async () => {
		try {
			await auth().signOut();
			// reset state to default (but finished loading)
			this.setState({loading: false, auth: false, user: null, startedAt: false});
		} catch (e) {
			console.log(e);
			Reactotron.log(e);
		}
	}

	onCommunity = (communityid) => {
		// User has joined or created a community
		this.props.navigation.pop()
		this.setState({...this.state, loading: true, community: communityid});
		this.checkStartedAt();
	}

	checkCommunity = async (uid) => {
		// entry -> is logged in? yes -> has a community?
		let user = await this.helper.getUser(uid);
		if(user.community === undefined || user.community === null) {
			this.setState({...this.state, loading: false});
		} else {
			// find age of user in days (age = 1 on first day of account creation)
			let createdDate = new Date(user.createdAt);
			let age = -this.helper.daysUntil(this.helper.toISO(createdDate));

			this.setState({...this.state, community: user.community, age: age});
			await this.checkStartedAt(user);
		}
	}

	checkStartedAt = async (user = null) => {
		// entry -> is logged in? yes -> has a community? yes -> has started retreat?
		// user is the mysql user entry
		if(user === null) {
			user = await this.helper.getUser(this.state.user.uid);
		}

		if(user.startedAt === undefined || user.startedAt === null) {
			this.setState({...this.state, started: false});
		} else {
			let daysUntilStart = this.helper.daysUntil(user.startedAt);
			let started = daysUntilStart <= 0;

			if(started) {
				// current day of the retreat (1, 2, 3, ...)
				let currentDay = -daysUntilStart;

				this.setState({...this.state, started: true, startedAt: user.startedAt, currentDay: currentDay});
			} else {
				// start date is in the future (probably next Ash Wednesday)
				this.setState({...this.state, started: false, daysUntil: daysUntilStart});
			}
		}

		await this.checkWord(user);
	}

	checkWord = async (user) => {
		let word = user.word;

		if(word === undefined || word === null || typeof(word) !== 'string' || word.indexOf("|") < 0) {
			this.setState({...this.state, word: null, wordExpired: true, loading: false});
			return;
		}

		let bar = word.indexOf("|");
		let wordDate = word.substring(0, bar);

		// expired = if the word is at least yesterday's word
		let expired = this.helper.daysUntil(wordDate) < 0;

		if(expired) {
			this.setState({...this.state, word: null, wordExpired: true, loading: false});
			return;
		}

		let wordText = word.substring(bar + 1);

		await this.setState({...this.state, word: wordText, wordExpired: false, loading: false});
	}

	onWord /* and upWord */ = async (word) => {
		this.props.navigation.pop()
		this.setState({...this.state, loading: true, word: word, wordExpired: false})

		let wordPlusDate = encodeURI(this.helper.toISO(this.today) + "|" + word);
		await this.helper.api('user', 'action=word&uid=' + encodeURI(this.state.user.uid) + '&word=' + wordPlusDate);
		this.setState({...this.state, loading: false})
	}

	render() {
		let navigation = this.props.navigation;

		if(this.state.loading) {
			return <LoadingScreen />;
		}

		if(!this.state.auth /* you call it overdramatic, I call it safety */
			|| this.state.user === undefined
			|| this.state.user === null
			|| this.state.user.uid === undefined
			|| this.state.user.uid === null) {

			// FirebaseLogin's login callback is nice, but doesn't call on
			// register. I added an onAuth callback that gets called for
			// both logging in and registering.
			/*navigation.navigate('login', {
				login: user => {},
				onAuth: this.onAuth,
			});*/
			return <FirebaseLogin login={user => {}} onAuth={this.onAuth} />

		}

		// if the user doesn't have a community, that is the first thing
		// they should do
		if(this.state.community === undefined) {
			/*navigation.navigate('join', {
				uid: this.state.user.uid,
				onCommunity: this.onCommunity,
			});*/
			return <JoinCommunityScreen uid={this.state.user.uid} onCommunity={this.onCommunity} reauth={this.reauth} />;
		}

		if(this.state.wordExpired) {
			/*navigation.navigate('word', {
				word: this.state.word,
				onNext: this.onWord,
			})
			*/
			return <WordScreen word={this.state.word} onNext={this.onWord} />
		}

		return <MainScreen reauth={this.reauth} logout={this.logout} user={this.state.user} community={this.state.community} currentDay={this.state.currentDay} daysUntil={this.state.daysUntil} started={this.state.started} startedAt={this.state.startedAt} age={this.state.age} />
	}
	
};
