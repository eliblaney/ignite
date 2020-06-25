import React, {Fragment} from 'react';
import IgniteHelper from './IgniteHelper.js';
import IgniteConfig from '../config/IgniteConfig.js';
import LoadingScreen from './LoadingScreen.js';
import {
	SafeAreaView,
	StyleSheet,
	ScrollView,
	View,
	Text,
	TouchableOpacity,
} from 'react-native';
import { Button, Icon, Slider } from 'react-native-elements';
import { default as VIcon } from 'react-native-vector-icons/SimpleLineIcons';
import LinearGradient from 'react-native-linear-gradient';
import Markdown from 'react-native-simple-markdown';
import Swiper from 'react-native-swiper'; /* Edits: comment {dots}, make conditional at componentWillReceiveProps include both statements */
import Colors from './Colors.js';
import Header from './Header.js';
import TrackPlayer from 'react-native-track-player';
import ashWednesdays from '../config/AshWednsedays';
import markdownstyles from './markdown-styles';

import Reactotron from 'reactotron-react-native';

class NavBar extends React.Component {
	constructor(props) {
		super(props);
		this.state = { date: this.props.date, day: this.props.day };
	}

	move = (pos) => {
		if(pos < 0 && this.isFirst()) return;
		if(pos > 0 && this.isLast()) return;

		this.state.date.setDate(this.state.date.getDate() + pos);
		this.setState({...this.state, day: this.state.day + pos});
		return this.props.onChange(this.state.date);
	}

	isFirst = () => {
		return this.state.day <= 1;
	}

	isLast = () => {
		if(this.props.isLent) {
			return this.state.day >= 51;
		}
		return this.state.day >= 40;
	}

	isFuture = () => {
		return this.state.date.getTime() + 24*60*60*1000 > Date.now();
	}

	render() {
		return (
			<Header
			title={this.props.title}
			left={!this.isFirst() ? <Button title="&lt;" titleStyle={styles.daynavArrow} type="clear" onPress={() => this.move(-1)} />:null}
			right={(!this.isLast() && !this.isFuture()) ? <Button title="&gt;" titleStyle={styles.daynavArrow} type="clear" onPress={() => this.move(1)} />:null}
			/>
		);
	}
}

class AudioProgressBar extends TrackPlayer.ProgressComponent {

	constructor(props) {
		super(props);
		this.state = { playing: false };
	}

	componentDidMount() {
		super.componentDidMount();
		this.onQueueEnded = TrackPlayer.addEventListener('playback-queue-ended', async (data) => {
			// This stops the player from repeating the queue...
			TrackPlayer.destroy();
			this.props.createTrackPlayer();
		});
		this.onPlaybackStateChange = TrackPlayer.addEventListener('playback-state', async (data) => {
			this.setState({ playing: (data.state === 'playing') });
		});
	}

	componentWillUnmount() {
		super.componentWillUnmount();
		this.onQueueEnded.remove();
		this.onPlaybackStateChange.remove();
	}

	render() {
		return (
			<View>
				<Text style={styles.audioHeader}>Today's Contemplation</Text>
				<View style={styles.progressBarView} >
					<TouchableOpacity>
					<Icon raised
						name={this.state.playing ? 'pause':'play'}
						type='font-awesome'
						color={Colors.tertiary}
						onPress={this.props.playPause}
					/>
					</TouchableOpacity>
					<View style={{flex: 1}}>
						<Slider disabled
							style={{width: '100%'}}
							value={this.getProgress()}
							thumbTintColor={Colors.tertiary}
							thumbStyle={{width: 12, height: 12}}
							minimumTrackTintColor={Colors.tertiary}
							maximumTrackTintColor="#777777"
						/>
					</View>
				</View>
			</View>
		);
	}

}

export default class Reflections extends React.Component {

	constructor(props) {
		super(props);
		this.state = { loading: true, text: "", isLent: false, splashText: "", suscipe: ""};

		this.helper = new IgniteHelper();

		// I dream of the day when JS Date will finally know the months of the year
		this.months = ["January", "February", "March", "April", "May", "June",
			"July", "August", "September", "October", "November", "December"];
		// it would be nice if it knew weekdays too
		this.weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	}

	// to create unique ids for the tracks, required by TrackPlayer
	uuidv4 = () => {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});
	}

	getContent = async (day, lang, religion, flag = 0) => {
		let response = await this.helper.api('day', "day=" + day + "&lang=" + lang + "&religion=" + religion + "&flag=" + flag);

		this.setState({...this.state, loading: false, text: response.content, audio: response.audio, day: day});

		this.createTrackPlayer();
	}

	createTrackPlayer = async () => {
		let audio = this.state.audio;
		if(audio !== undefined && audio !== null && audio.length > 0) {
			TrackPlayer.setupPlayer().then(async () => {
				var track = {
					id: this.uuidv4(),
					url: audio,
					title: 'Day ' + this.state.day + ' Contemplation',
					artist: 'Ignite',
				}
				await TrackPlayer.reset();
				await TrackPlayer.add(track);
			});
		}
	}

	getDay = (date) => {
		// day refers to the current day of the retreat (1, 2, 3, etc)
		// we obtain this value by subtracting the starting date from the
		// target date and converting from milliseconds to days
		let day = parseInt((date - this.state.startedAt)/1000/60/60/24, 10);
		return day;
	}

	updateContent = (date) => {
		let day = this.getDay(date);

		let isSunday = (date.getDay() === 0);

		this.setState({...this.state, date: date, isSunday: isSunday});

		this.getContent(day, this.state.lang, this.state.faith);
	}

	// figures out whether the user has started yet and where in the retreat they are based on the day of the week
	// Sundays are break days so it must be aware of those in order to tell the user about it
	async componentDidMount() {
		let user = await this.helper.api('user', 'action=getu&uid=' + this.props.uid);

		let community = await this.helper.api('community', 'action=geti&id=' + this.props.community);
		let members = community.members;
		if(typeof(members) === 'string') {
			members = community.members = JSON.parse(community.members)
		}
		let isOwner = (members[0] === this.props.uid);
		
		// avoid unnecessary re-renders from react-native-swiper
		if(Reflections.initialized) return
		Reflections.initalized = true

		// only need to load data if we've actually started the retreat
		if(!this.props.startedAt) {
			this.setState({startedAt: false, loading: false, isOwner: isOwner})
			return
		}

		let lang = user.lang;
		let faith = user.faith;
		let suscipe = user.suscipe;
		if(suscipe != null) {
			suscipe = this.helper.decrypt(suscipe, true);
		} else {
			suscipe = IgniteConfig.suscipe;
		}

		// who even cares about the 2038 problem? ISO 8601 strings are wonderful
		let startedAt = new Date(this.props.startedAt);
		startedAt.setHours(0);
		startedAt.setMinutes(0);
		startedAt.setSeconds(0);
		startedAt.setMilliseconds(0);

		// determine whether this is a Lenten retreat to set
		// the maximum length of the reflections
		let isLent = false;
		for(var i = 0; i < ashWednesdays.length; i++) {
			var aw = ashWednesdays[i];
			var daw = new Date(aw);
			daw = new Date(daw.getTime() + daw.getTimezoneOffset()*60*1000);
			if(startedAt.getFullYear() === daw.getFullYear() && startedAt.getMonth() === daw.getMonth() && startedAt.getDate() === daw.getDate()) {
				isLent = true;
				break;
			}
		}

		this.setState({...this.state, lang: lang, faith: faith, startedAt: startedAt, isOwner: isOwner, isLent: isLent, splashText: this.splashText(), suscipe: suscipe});

		let date = new Date();
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
		date.setMilliseconds(0);

		var day = this.getDay(date);
		if(!isLent && day > 40) {
			// if it's a normal 40-day retreat, the last date
			// that exists is 39 days after the first day
			date = new Date(startedAt.toISOString());
			date.setDate(date.getDate() + 39);
		} else if(day > 51) {
			// if it's a Lenten 51-day retreat, the last date
			// that exists is 50 days after the first day
			date = new Date(startedAt.toISOString());
			date.setDate(date.getDate() + 50);
		}
		if(day < 1) {
			// and if somehow this happens...
			date = startedAt;
		}

		this.updateContent(date);
	}

	destroyPlayer = async () => {
		TrackPlayer.destroy();
	}

	componentWillUnmount() {
		this.destroyPlayer();
	}

	shouldComponentUpdate(nextProps, nextState) {
		// we don't need to re-render while we're loading data
		return !nextState.loading
	}

	isPlaying = async () => {
		let state = await TrackPlayer.getState();
		return state === 'playing';
	}

	playPause = async () => {
		let playing = await this.isPlaying();
		if(playing) {
			await TrackPlayer.pause();
		} else {
			await TrackPlayer.play();
		}
	}

	splashText = () => {
		let splashes = ['Almost there!', 'Soon and very soon!', 'Getting closer!']
		return splashes[Math.floor(Math.random() * splashes.length)]
	}

	render() {
		if(this.state.loading) {
			return (
				<LoadingScreen />
			);
		}

		if(!this.props.startedAt) {
			// user hasn't started the retreat yet
			let splashText = this.state.splashText;
			let daysUntil = this.props.daysUntil;
			return (
				<LinearGradient colors={[Colors.primary, Colors.secondary]} style={[styles.container, styles.gradientBackground]}>
					<Text style={{fontSize: 26, fontWeight: 'bold', marginBottom: 50, color: Colors.primaryText}}>
						{splashText}
					</Text>
					<Text style={{color: Colors.primaryText, fontSize: 16, margin: 20}}>
						{
							daysUntil > 0 ? (
								"The retreat starts in " + daysUntil + " day" + (daysUntil == 1 ? "":"s") + ". While you wait, read more about Ignite on the Kindling page!"
							) : (
								this.state.isOwner ?
								"Welcome to Ignite! You are your community's leader, so set a start date for the retreat and invite your friends to join you!"
								: "It looks like your group coordinator hasn't set a retreat start date yet. While you wait, read more about Ignite on the Kindling page!"
							)
						}
					</Text>
					<View style={{marginTop: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
						<VIcon name='arrow-left' size={20} style={{marginRight: 20}} color={Colors.primaryText} />
						<Text style={{color: Colors.primaryText}}>Try swiping left and right!</Text>
						<VIcon name='arrow-right' size={20} style={{marginLeft: 20}} color={Colors.primaryText} />
					</View>
				</LinearGradient>
			);
		}

		let date = this.state.date;
		// maybe I'm asking too much of our poor Date object, but having a
		// Date.prototype.format() in the built-in library would be lovely
		let dateString = this.weekdays[date.getDay()] + " "
			+ this.months[date.getMonth()] + " "
			+ date.getDate();

		let sundayComponent;
		if(this.state.isSunday) {
			sundayComponent = (
				<View style={styles.sundayView}>
					<Text style={styles.sundayTitle}>🎉It's Sunday!🎉</Text>
					<Text style={styles.sundayText}>Just for today, you can break your fast. You should still keep adhering to the principles of silence.</Text>
				</View>
			);
		}

		let audioComponent;
		if(this.state.audio !== undefined && this.state.audio !== null && this.state.audio.length > 0) {
			audioComponent = (
				<AudioProgressBar playPause={this.playPause} createTrackPlayer={this.createTrackPlayer} />
			);
		}

		return (
			<View style={styles.container}>
				<NavBar title={dateString} isLent={this.state.isLent} startedAt={this.props.startedAt} date={date} day={this.state.day} onChange={this.updateContent} />
				<View style={styles.readerContainer}>
					<ScrollView showVerticalScrollIndicator={false}>
						{sundayComponent}
						<Text style={{marginBottom: 30}}>
						{this.state.suscipe}
						</Text>
						<Markdown styles={markdownstyles} style={styles.maintext}>
							{this.state.text}
						</Markdown>
						{audioComponent}
					</ScrollView>
				</View>
			</View>
		);
	}

};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "flex-start",
		alignItems: "stretch",
		backgroundColor: Colors.background,
	},
	readerContainer: {
		flex: 6,
		backgroundColor: Colors.background,
		padding: 20, // maybe I should change this to margin to fix text getting cut off??
		fontSize: 26,
	},
	maintext: {
		marginBottom: 40,
		color: Colors.primaryText,
	},
	daynavArrow: {
		fontSize: 24,
		color: Colors.primaryText,
	},
	sundayView: {
		backgroundColor: Colors.secondary,
		borderRadius: 10,
		padding: 10,
		alignItems: "center",
		marginBottom: 20,
	},
	sundayTitle: {
		// always dark text for aqua backgrounds
		color: "#222222",
		fontSize: 18,
		fontWeight: "bold",
	},
	sundayText: {
		// always dark text for aqua backgrounds
		color: "#222222",
	},
	progressBarView: {
		borderRadius: 50,
		backgroundColor: Colors.subview,
		padding: 10,
		margin: 20,
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		paddingRight: 20,
	},
	audioHeader: {
		fontSize: 23,
		textAlign: 'center',
		marginTop: 20,
		color: Colors.fadedText,
		fontWeight: 'bold',
	},
	gradientBackground: {
		justifyContent: 'center',
		alignItems: 'center',
		position: "absolute",
		top: 0,
		bottom: 0,
		right: 0,
		left: 0,
	},
});
