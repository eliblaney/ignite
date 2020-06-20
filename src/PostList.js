import React from 'react';
import { FlatList, View, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import Colors from './Colors.js';
import { Avatar, ButtonGroup, ListItem, Text } from 'react-native-elements';
import IgniteHelper from './IgniteHelper.js';
import LoadingScreen from './LoadingScreen.js';
import Reactotron from 'reactotron-react-native';

class PostElement extends React.PureComponent {

	constructor(props) {
		super(props);
		this.props = props;
		this.helper = new IgniteHelper();
	}

	truncate = (post) => {
		let words = this.props.previewWordLimit;
		let suffix = "";
		let p = post.replace(/(\r\n|\n|\r)/gm, " ").trim().replace(/ +/g, " ").split(" ");
		if(p.length > words) {
			suffix = "...";
		}

		let truncated = p.splice(0, words).join(" ");
		if(truncated.length > 32) {
			suffix = "...";
			truncated = truncated.substring(0, 32).trim();
		}
		return truncated + suffix;
	}

	render() {
		let i = this.props.id;
		let p = this.props.post;
		let user = this.props.user;
		
		let preview;
		try {
			preview = this.truncate(this.helper.decrypt(p.data, p.privacy == 0));
		} catch(e) {
			return null
		}

		return (
			<TouchableOpacity key={i} onPress={() => this.props.openPost(p, user, this.props.owner)}>
			<ListItem
			key={i}
			roundAvatar
			title={(this.props.owner ? "You" : user.name) + ", " + this.helper.movementText(this.helper.getMovement(p.day))}
			subtitle={preview}
			leftAvatar={<Avatar rounded title={this.helper.initials(user.name)} overlayContainerStyle={styles.avatar} />}
			containerStyle={{backgroundColor: Colors.modalBackground}}
			titleStyle={{color: Colors.fadedText, fontSize: 13}}
			subtitleStyle={{color: Colors.modalText, fontSize: 14}}
			chevron={true}
			/>
			</TouchableOpacity>);
	}

}

export default class PostList extends React.Component {


	constructor(props) {
		super(props);
		this.helper = new IgniteHelper();
		this.state = { postData: [], posts: [], loading: true, filter: 1, canLoadMore: true };
		// offset variable for posts
		this.page = 1;
		this.refreshing = false;
		this.loadingMore = false;
	}

	async componentDidMount() {
		let user = await this.helper.getUser(this.props.uid);
		this.setState({...this.state, user: user});
		this.read();
	}

	read = async (clean = false) => {
		let posts = this.state.postData;
		if(clean) {
			this.page = 1;
			posts = [];
		}
		let data = await this.helper.api('user', 'action=read&uid=' + this.props.uid + "&day=" + this.props.currentDay + '&page=' + this.page);
		let newposts = data.posts || []; // if there are no posts to display, server returns undefined for data.posts

		let canLoadMore = true;
		let itemsPerPage = 5; // api returns posts in blocks of 5
		if(newposts.length < itemsPerPage) {
			// if the new page is incomplete (or empty),
			// then this is the end of the list
			canLoadMore = false;

			if((posts.length % itemsPerPage) > 0) {
				// if there's an incomplete page,
				// then it will get overwritten
				//
				// this is usually an issue when
				// the user or community has
				// less than 5 posts total
				while((posts.length % itemsPerPage) > 0) {
					posts.pop();
				}
			}
		} else {
			this.page++;
		}

		posts.push(...newposts);

		// difference between postData and posts
		// postData = all posts
		// posts = filtered so that posts from the future points in the retreat aren't shown
		// it is organized this way so that the indices between api posts and user uids are synchronized
		this.setState({...this.state, postData: posts, posts: posts.filter(p => p.distance >= 0), canLoadMore: canLoadMore});
		this.populateUsers();
	}

	populateUsers = async () => {
		let users = await Promise.all(this.state.posts.map(async (p, i) => {
			let u = await this.helper.getUser(p.user);
			return u;
		}));
		this.setState({...this.state, users: users, loading: false});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return !nextState.loading && nextState.posts.length === nextState.users.length;
	}

	async componentDidUpdate() {
		if(this.props.doRefresh && !this.refreshing && !this.state.loading) {
			this.refreshing = true;
			this.props.refreshing(true);
			await this.read(true);
			this.props.refreshing(false);
			this.refreshing = false;
		}
		if(this.props.loadMore && !this.state.loading) {
			await this.read(false);
		}
	}

	filter = (i) => {
		this.setState({...this.state, filter: i});
	}

	render() {
		if(this.state.loading) {
			return (
				<LoadingScreen />
			);
		}

		let uid = this.props.uid;
		let filter = this.state.filter;
		let community = this.state.user.community;

		return (
			<View style={[styles.container, this.props.style]}>
			<Text style={styles.title}>{this.props.title}</Text>
			<Text style={styles.filterText}>Filter</Text>
			<ButtonGroup onPress={this.filter}
				selectedIndex={filter}
				buttons={['Myself', 'Community', 'Everyone']}
				containerStyle={{height: 30, backgroundColor: "transparent"}}
				textStyle={{fontSize: 14}}
				buttonStyle={{backgroundColor: "transparent"}}
			/>

			<FlatList
				data={this.state.posts}
				extraData={[this.state.posts, filter]}
				renderItem={(item) => {
					let p = item.item;
					let user = this.state.users[item.index];

					if(user === undefined) {
						// users are still being queried
						return null;
					}
					if(filter === 0 && p.user !== uid) {
						return null;
					}
					if(filter === 1 && p.community !== community) {
						return null;
					}

					return (
						<PostElement
							key={item.index}
							id={item.index}
							post={p}
							openPost={this.props.openPost}
							user={user}
							owner={user.uid === this.props.uid}
							previewWordLimit={this.props.previewWordLimit}
						/>
					);
				}}
			/>
			</View>
		);
	}

};

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.modalBackground,
		marginTop: 20,
	},
	avatar: {
		backgroundColor: Colors.primary,
	},
	title: {
		color: Colors.modalText,
		fontSize: 20,
		textAlign: 'center',
	},
	filterText: {
		textAlign: 'left',
		fontSize: 18,
		color: Colors.fadedText,
		marginLeft: 10,
	}
});
