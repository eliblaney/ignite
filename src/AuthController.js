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
		return { header: null }
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
		// This is called when the retreat start date changes,
		// for a fresh perspective
		this.setState({ loading: true, auth: false, user: null, word: null, currentDay: null, daysUntil: null, startedAt: false });
		this.componentDidMount();
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
		let user = await this.helper.api('user', "action=getu&uid=" + uid);
		if(user.community === undefined || user.community === null) {
			this.setState({...this.state, loading: false});
		} else {
			// find age of user in days (age = 1 on first day of account creation)
			let createdDate = new Date(parseInt(user.createdAt))
			createdDate.setHours(0)
			createdDate.setMinutes(0)
			createdDate.setSeconds(0)
			createdDate.setMilliseconds(0)
			let age = parseInt((this.today - createdDate)/1000/60/60/24, 10) + 1

			this.setState({...this.state, community: user.community, age: age});
			await this.checkStartedAt(user);
		}
	}

	checkStartedAt = async (user = null) => {
		// entry -> is logged in? yes -> has a community? yes -> has started retreat?
		// user is the mysql user entry
		if(user === null) {
			user = await this.helper.api('user', "action=getu&uid=" + this.state.user.uid);
		}

		if(user.startedAt === undefined || user.startedAt === null) {
			this.setState({...this.state, started: false});
		} else {
			let now = Date.now();
			let dateStarted = Date.parse(user.startedAt);
			let started = now > dateStarted;

			// preserved time data
			let actualStartedAt = user.startedAt;

			// remove time data for accurate date comparison
			let startedAt = new Date(Date.parse(actualStartedAt))
			startedAt.setHours(0)
			startedAt.setMinutes(0)
			startedAt.setSeconds(0)
			startedAt.setMilliseconds(0)

			if(started) {
				// current day of the retreat (1, 2, 3, ...)
				let currentDay = parseInt((this.today - startedAt)/1000/60/60/24, 10) + 1

				this.setState({...this.state, started: true, startedAt: startedAt, currentDay: currentDay});
			} else {
				// Days until the retreat starts
				let daysUntil = parseInt((startedAt - this.today)/1000/60/60/24, 10)

				// start date is in the future (probably next Ash Wednesday)
				this.setState({...this.state, started: false, daysUntil: daysUntil});
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

		let wordDate = new Date(Date.parse(word.substring(0, bar)));
		wordDate.setHours(0);
		wordDate.setMinutes(0);
		wordDate.setSeconds(0);
		wordDate.setMilliseconds(0);

		// expired = if the word is at least yesterday's word
		let expired = parseInt((this.today - wordDate)/1000/60/60/24, 10) > 0;
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

		let wordPlusDate = encodeURI(this.today.toISOString() + "|" + word);
		await this.helper.api('user', 'action=word&uid=' + this.state.user.uid + '&word=' + wordPlusDate);
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

		return <MainScreen reauth={this.reauth} user={this.state.user} community={this.state.community} currentDay={this.state.currentDay} daysUntil={this.state.daysUntil} started={this.state.started} startedAt={this.state.startedAt} age={this.state.age} />
	}
	
};
