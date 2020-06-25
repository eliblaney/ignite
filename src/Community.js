import React from 'react';
import { RefreshControl, View, Text, TextInput, TouchableHighlight, ScrollView, StyleSheet, Share } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import IgniteHelper from './IgniteHelper.js';
import Colors from './Colors.js';
import LoadingScreen from './LoadingScreen.js';
import UserList from './UserList.js';
import PostList from './PostList.js';
import Header from './Header.js';
import { Avatar, Button, ButtonGroup, Card, Input, ListItem, Overlay, Tooltip } from 'react-native-elements';
import DatePicker from 'react-native-datepicker';
import Reactotron from 'reactotron-react-native';
import ashWednesdays from '../config/AshWednsedays';

export default class Community extends React.Component {

	constructor(props) {
		super(props);

		this.today = new Date();
		this.today.setHours(0);
		this.today.setMinutes(0);
		this.today.setSeconds(0);
		this.today.setMilliseconds(0);

		this.state = { pickDate: false, isWriting: false, cancelWriting: false, writePostPrivacy: 1, ashWednesday: "...", chosenStartDate: null };
	}

	async componentDidMount() {
		this.helper = new IgniteHelper();
		let community = await this.helper.api('community', 'action=geti&id=' + this.props.community);
		let members = community.members;
		if(typeof(members) === 'string') {
			members = community.members = JSON.parse(community.members)
		}
		let users = await Promise.all(members.map(async (m) => {
			let u = await this.getUser(m);
			return u;
		}));
		// Because the creator of the community is the first member...
		let isOwner = (members[0] === this.props.uid);
		let joinComponent
		if(!this.props.startedAt && community.joincode !== undefined && community.joincode !== null && community.joincode.length > 0) {
			let joincode = community.joincode.toUpperCase();
			joinComponent = (
				<View style={styles.joincodeView}>
						<Text style={styles.joincodeTitle}>Your join code is:</Text>
					<Text onPress={() => Share.share({
						// now that's what I call spreading the holy fire of Big J
						message: "🔥 Join my Ignite community!\n🔥 Here's the code: " + joincode
					})} style={styles.joincodeText}>{joincode}</Text>
					<Text style={styles.joincodeDesc}>This code is used to let others join your community!</Text>
				</View>
			);
		}
		let postButton;
		if(this.props.startedAt === false) {
			postButton = (
				<Tooltip backgroundColor={Colors.tertiary} popover={<Text style={{color: Colors.primaryText}}>You can post when the retreat starts!</Text>} withOverlay={false} width={275} >
					<Button disabled title="Write Post" type="solid" style={{width: '100%'}} />
				</Tooltip>
			);
		} else {
			postButton = (
				<Button title="Write Post" type="solid" onPress={() => this.setState({...this.state, isWriting: true})} style={{width: '100%'}} />);
		}

		// get next ash wednesday date
		var nextAshWednesday = "";
		if(!this.props.currentDay) {
			for(var i = 0; i < ashWednesdays.length; i++) {
				var aw = ashWednesdays[i];
				var daw = Date.parse(aw);
				if(Date.now() < daw) {
					nextAshWednesday = new Date(aw);
					nextAshWednesday.setTime(nextAshWednesday.getTime() + nextAshWednesday.getTimezoneOffset()*60*1000);
					nextAshWednesday = nextAshWednesday.toLocaleDateString("en-US");
					break;
				}
			}
		}

		this.setState({...this.state, community: community, users: users, isOwner: isOwner, joinComponent: joinComponent, postButton: postButton, ashWednesday: nextAshWednesday});
	}

	getUser = async (uid) => {
		let user = await this.helper.api('user', 'action=getu&uid=' + uid);
		return user;
	}

	post = async () => {
		let text = this.state.writePostText;
		if(text !== undefined && text !== null && text.length > 0 && text.length <= 8000) {
			this.setState({...this.state, isWriting: false, writePostText: null});
			let privacy = this.state.writePostPrivacy;
			let post = encodeURI(this.helper.encrypt(this.state.writePostText, privacy === 0));
			let date = encodeURI((new Date()).toISOString());
			let result = await this.helper.api('user', 'action=post&uid=' + this.props.uid + '&date=' + date + '&day=' + this.props.currentDay + '&priv=' + privacy + '&data=' + post);
		}
		this.props.reauth();
	}

	openPost = (post, user, isOwner) => {
		let deletePostButton;
		if(isOwner) {
			deletePostButton = (
				<Button onPress={() => this.setState({...this.state, postDetailComponentCache: this.state.postDetailComponent, postDetailComponent: null, deletePost: post.id})}
					title="Delete Post"
					type="outline"
					titleStyle={{fontSize: 14, color: "#cc2222"}}
					buttonStyle={{borderColor: "#cc2222", margin: 10, marginLeft: 25, marginRight: 25}}
				/>
			);
		}
		let postDetailComponent = (
			<Overlay
			isVisible={post !== null}
			overlayStyle={{backgroundColor: Colors.modalBackground}}
			onBackdropPress={() => this.setState({...this.state, postDetailComponent: null})}>
					<View style={{flex: 1}}>
							<Button onPress={() => this.setState({...this.state, postDetailComponent: null})}
									title="Close"
									type="outline"
									titleStyle={{fontSize: 14}}
									buttonStyle={{marginTop: 10}}
							/>
							{deletePostButton}
							<ListItem
								roundAvatar
								title={user.name}
								subtitle={this.helper.timeSince(new Date(Date.parse(post.date)))}
								leftAvatar={<Avatar rounded title={this.helper.initials(user.name)} overlayContainerStyle={{backgroundColor: Colors.primary}} />}
								containerStyle={{backgroundColor: Colors.modalBackground, marginBottom: 20, marginRight: 100, width: '100%'}}
								titleStyle={{color: Colors.modalText, fontSize: 18}}
								subtitleStyle={{color: Colors.fadedText, fontSize: 14}}
							/>
						<ScrollView style={{flex: 1}}>
							<Text style={{marginLeft: 10, lineHeight: 20, color: Colors.modalText}}>{this.helper.decrypt(post.data, post.privacy == 0)}</Text>
						</ScrollView>
					</View>
			</Overlay>
		);
		this.setState({isWriting: false, cancelWriting: false, postDetailComponent: postDetailComponent});
	}

	refreshing = (set) => {
		this.setState({...this.state, refreshing: set});
	}

	isCloseToBottom = ({layoutMeasurement, contentOffset, contentSize}) => {
		const paddingToBottom = 20;
		return layoutMeasurement.height + contentOffset.y >=
			contentSize.height - paddingToBottom;
	};

	render() {
		if(this.state.community === undefined) {
			return (<LoadingScreen />);
		}

		// a share-join-code view if the community has not started the retreat yet
		let joinComponent = this.state.joinComponent;
		// a button to create posts, which is disabled before the user starts the retreat
		let postButton = this.props.startedAt ? this.state.postButton : undefined;
		// if a user taps on a post, this component will show the details
		let postDetailComponent = this.state.postDetailComponent;

		let postList;
		let startButton;
		let startText;
		let daysUntil = this.props.daysUntil
		if(daysUntil > 0) {
			startText = (
				<Text style={{textAlign: 'center', marginBottom: 10}}>
				Ignite will begin in {daysUntil} day{daysUntil == 1 ? '':'s'}, on {new Date(this.today.getTime() + daysUntil*24*60*60*1000 + this.today.getTimezoneOffset()*60*1000).toLocaleDateString('en-US')}.
				</Text>
			)
		}
		if(this.props.startedAt) {
			postList = (
				<PostList title="POSTS"
					previewWordLimit={5}
					uid={this.props.uid}
					currentDay={this.props.currentDay}
					openPost={this.openPost}
					doRefresh={doRefresh}
					loadMore={loadMore}
					refreshing={this.refreshing}
				/>
			);
		} else if(this.state.isOwner){
			startButton = (
				<Button title="Choose retreat start date" type="solid" onPress={() => this.setState({...this.state, pickDate: true})} style={{width: '100%', marginBottom: 10}} />
			);
		}

		
		// whether to refresh the post list
		let doRefresh = false;
		if(this.state.doRefresh) {
			this.setState({...this.state, doRefresh: false});
			doRefresh = true;
		}

		// whether to load more of the list
		let loadMore = false;
		if(this.state.loadMore) {
			this.setState({...this.state, loadMore: false});
			loadMore = true;
		}

		let month = this.today.getMonth() + 1;
		if(month < 10) {
			month = "0" + month;
		}
		let day = this.today.getDate();
		if(day < 10) {
			day = "0" + day;
		}
		let todayString = this.today.getFullYear() + "-" + month + "-" + day;
		let maxDateString = (this.today.getFullYear() + 1) + "-" + month + "-" + day;

		return (
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={this.state.refreshing}
						onRefresh={() => this.setState({...this.state, doRefresh: true})}
					/>
				}
				onScroll={({nativeEvent}) => {
					if(this.isCloseToBottom(nativeEvent)) {
						this.setState({...this.state, loadMore: true});
					}
				}}
				style={{backgroundColor: Colors.background, height: '100%'}}>
				<Header
					title="Community"
				/>
				<View style={styles.container}>
					{joinComponent}
					{startButton}
					{startText}
					<UserList title={this.state.community.name} users={this.state.users} style={styles.userlist} />
					{postButton}
					{postList}
				</View>

				<Overlay isVisible={this.state.pickDate} overlayStyle={{backgroundColor: Colors.modalBackground, height: 300}}>
					<View style={{flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
						<Text style={{fontSize: 26, color: Colors.modalText}}>Set Start Date</Text>
						<Text style={{color: Colors.modalText}}>Ash Wednesday will be on {this.state.ashWednesday}.</Text>
						<DatePicker
							style={{width: 200}}
							date={this.state.chosenStartDate}
							mode="date"
							placeholder="Tap to choose date"
							format="YYYY-MM-DD"
							minDate={todayString}
							maxDate={maxDateString}
							confirmBtnText="Confirm"
							cancelBtnText="Cancel"
							onDateChange={(date) => {this.setState({chosenStartDate: date});}}
						/>
						<Text style={{color: Colors.modalText}}>You can change the start date until Ignite begins.</Text>
						<View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 40, marginBottom: 40}}>
							<Button onPress={() => this.setState({...this.state, pickDate: false, chosenStartDate: null})}
									title="Cancel"
									type="outline"
									titleStyle={{fontSize: 16}}
									buttonStyle={{marginRight: 10}}
							/>
							<Button onPress={async () => {
								var startDate = this.state.chosenStartDate;
								await this.helper.api('community', "action=ignite&id=" + encodeURI(this.props.community) + "&start=" + encodeURI(startDate));
								this.setState({...this.state, pickDate: false});
								this.props.reauth();
							}}
									title="Confirm"
									type="solid"
									titleStyle={{fontSize: 16}}
									buttonStyle={{backgroundColor: "#228822", marginLeft: 10, paddingLeft: 10, paddingRight: 10}}
							/>
						</View>
					</View>
				</Overlay>

				<Overlay isVisible={this.state.isWriting} overlayStyle={{backgroundColor: Colors.modalBackground}}>
					<View style={{flex: 1}}>
						<TextInput
							placeholder=" Write your post here!"
							placeholderTextColor={Colors.fadedText}
							multiline={true}
							maxLength={8000}
							onChangeText={(text) => this.setState({...this.state, writePostText: text})}
							value={this.state.writePostText}
							style={{backgroundColor: Colors.modalBackground, color: Colors.modalText, margin: 10, borderRadius: 5, borderColor: "#888888", borderWidth: 1, borderStyle: "solid", flex: 1}}
						/>
						<Text style={{marginLeft: 10, marginTop: 30, fontSize: 18, color: Colors.fadedText}}>Visibility</Text>
						<ButtonGroup onPress={(i) => this.setState({...this.state, writePostPrivacy: i})}
									selectedIndex={this.state.writePostPrivacy}
									buttons={['Myself', 'Community', 'Everyone']}
									containerStyle={{height: 30, backgroundColor: "transparent"}}
									textStyle={{fontSize: 14}}
									buttonStyle={{backgroundColor: "transparent"}}
						/>
						<Text style={{color: Colors.fadedText, fontSize: 16, textAlign: 'center'}}>{this.state.writePostPrivacy ? this.state.writePostPrivacy > 1 ? 'Everyone using the app will be able to see this post.':'Only your community will be able to see this post.':'Only you will be able to see this post.'}</Text>
						<View style={{flexDirection: 'row', justifyContent: 'flex-end', marginTop: 40, marginBottom: 40}}>
							<Button onPress={() => this.setState({...this.state, isWriting: false, cancelWriting: true})}
									title="Cancel"
									type="outline"
									titleStyle={{fontSize: 16}}
									buttonStyle={{marginRight: 10}}
							/>
							<Button onPress={this.post}
									title="Post"
									type="solid"
									titleStyle={{fontSize: 16}}
									buttonStyle={{backgroundColor: "#228822", marginLeft: 10, paddingLeft: 10, paddingRight: 10}}
							/>
						</View>
					</View>
				</Overlay>

				<Overlay isVisible={this.state.cancelWriting}
						overlayStyle={{backgroundColor: Colors.modalBackground}}
						onBackdropPress={() => this.setState({...this.state, isWriting: true, cancelWriting: false})}>
					<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
						<Text style={{fontSize: 22, marginBottom: 10, textAlign: 'center', color: Colors.modalText}}>Are you sure you want to discard your post?</Text>
						<View style={{flexDirection: 'row'}}>
							<Button onPress={() => this.setState({...this.state, isWriting: true, cancelWriting: false})}
									title="Keep Writing"
									type="outline"
									titleStyle={{fontSize: 16}}
									buttonStyle={{marginRight: 10}}
							/>
							<Button onPress={() => this.setState({...this.state, cancelWriting: false, writePostText: null})}
									title="Discard Post"
									type="solid"
									titleStyle={{fontSize: 16}}
									buttonStyle={{backgroundColor: "#cc2222", marginLeft: 10}}
							/>
						</View>
					</View>
				</Overlay>

				<Overlay isVisible={this.state.deletePost !== undefined && this.state.deletePost !== null && this.state.deletePost !== false}
						overlayStyle={{backgroundColor: Colors.modalBackground}}
						onBackdropPress={() => this.setState({...this.state, postDetailComponent: this.state.postDetailComponentCache, postDetailComponentCache: null, deletePost: false})}>
					<View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
						<Text style={{fontSize: 22, marginBottom: 10, textAlign: 'center', color: Colors.modalText}}>Are you sure you want to discard your post?</Text>
						<View style={{flexDirection: 'row'}}>
							<Button onPress={() => this.setState({...this.state, postDetailComponent: this.state.postDetailComponentCache, postDetailComponentCache: null, deletePost: false})}
									title="Cancel"
									type="outline"
									titleStyle={{fontSize: 16}}
									buttonStyle={{marginRight: 10}}
							/>
							<Button onPress={() => {
										this.helper.api('user', 'action=delp&id=' + this.state.deletePost);
										this.setState({...this.state, postDetailComponentCache: null, deletePost: false, doRefresh: true});
									}}
									title="Delete Post"
									type="solid"
									titleStyle={{fontSize: 16}}
									buttonStyle={{backgroundColor: "#cc2222", marginLeft: 10}}
							/>
						</View>
					</View>
				</Overlay>
				{postDetailComponent}
			</ScrollView>
		);
	}

};

const styles = StyleSheet.create({
	container: {
		flexDirection: "column",
		justifyContent: "space-evenly",
		alignItems: "stretch",
		marginLeft: 20,
		marginRight: 20,
		marginBottom: 50,
	},
	userlist: {
		borderRadius: 10,
		width: "100%",
		marginLeft: 0,
		marginBottom: 20,
	},
	joincodeText: {
		fontSize: 64,
		fontFamily: "ClaxtonLight",
		padding: 10,
		textAlign: "center",
		borderRadius: 5,
		color: Colors.text,
	},
	joincodeTitle: {
		color: Colors.text,
		fontSize: 24,
		textAlign: "center",
		marginTop: 20,
		marginBottom: 10,
	},
	joincodeDesc: {
		color: Colors.text,
		textAlign: "center",
		marginTop: 10,
		marginBottom: 20,
	},
});
