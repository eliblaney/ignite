import React from 'react';
import auth from "@react-native-firebase/auth";
import { Fragment, ScrollView, View, Text, TextInput, StyleSheet } from 'react-native';
import { Button } from 'react-native-elements';
import Colors from './Colors.js';
import { withNavigation } from 'react-navigation';
import SettingsList from 'react-native-settings-list';
import Markdown from 'react-native-simple-markdown';
import Header from './Header'
import IgniteConfig from '../config/IgniteConfig';
import IgniteHelper from './IgniteHelper';

import Reactotron from 'reactotron-react-native';

const Account = withNavigation(class Navigation extends React.Component {

	constructor(props) {
		super(props);

		this.params = this.props.navigation.state.params;
		this.state = {uid: this.params.uid};
	}

	logout = () => {
		auth().signOut().then(() => {
			this.props.navigation.goBack();
			this.params.logout()
		});
	}

	static navigationOptions = ({navigation}) => {
		return {
			headerMode: 'float',
			headerBackTitleVisible: true,
			title: 'Edit Account'
		}
	}

	render() {
		return (
			<View style={{flex: 1, flexDirection: 'column'}}>
				<Button onPress={this.logout}
				title="Logout"
				type="solid"
				titleStyle={{fontSize: 16}}
				buttonStyle={{margin: 10, backgroundColor: "#dd2222"}}
				/>
			</View>
		);
	}

});

const Suscipe = withNavigation(class Suscipe extends React.Component {

	constructor(props) {
		super(props);

		this.helper = new IgniteHelper();

		let params = this.props.navigation.state.params;
		this.state = {uid: params.uid, suscipe: IgniteConfig.suscipe};
	}

	async componentDidMount() {
		let user = await this.helper.api('user', 'action=getu&uid=' + this.state.uid);
		let suscipe = user.suscipe;
		if(suscipe !== null) {
			this.setState({...this.state, suscipe: this.helper.decrypt(suscipe, true)});
		}
	}

	static navigationOptions = ({navigation}) => {
		return {
			headerMode: 'float',
			headerBackTitleVisible: true,
			title: 'Edit Suscipe'
		}
	}

	render() {
		return (
			<View style={{flex: 1, flexDirection: 'column'}}>
				<TextInput
					style={{margin: 10, height: 200, borderColor: 'gray', borderWidth: 1}}
					multiline={true}
					numberofLines={8}
					onChangeText={(text) => this.setState({...this.state, suscipe: text})}
					value={this.state.suscipe}
				/>
				<Button onPress={async () => {
					let suscipe = this.state.suscipe;
					if(!suscipe || suscipe.length < 1) {
						suscipe = IgniteConfig.suscipe;
					}
					await this.helper.api('user', "action=susc&uid=" + encodeURI(this.state.uid) + "&data=" + encodeURI(this.helper.encrypt(suscipe, true)));
					this.props.navigation.pop();
				}}
				title="Save"
				type="solid"
				titleStyle={{fontSize: 16}}
				buttonStyle={{margin: 10, backgroundColor: "#228822"}}
				/>
			</View>
		);
	}

})

const KindlingDetail = withNavigation(class KindlingDetail extends React.Component {

	constructor(props) {
		super(props)
		this.state = { ...this.props.navigation.state.params, filetext: "" }
	}

	static navigationOptions = ({navigation}) => {
		return {
			headerMode: 'float',
			headerBackTitleVisible: true,
			title: navigation.getParam('title', 'Ignite')
		}
	}

	async componentDidMount() {
		//let file = "./kindling/" + this.state.file + ".md"
		fetch("https://eliblaney.com/ignite/api/v1/kindling/" + this.state.file + ".md").then(response => response.text()).then(text => this.setState({...this.state, filetext: text}));

		/*let rawFile = new XMLHttpRequest()
		/*rawFile.open("GET", file, false)
		/*rawFile.onreadystatechange = () => {
			if(rawFile.readyState === 4) {
				if(rawFile.status === 200 || rawFile.status == 0) {
					let filetext = rawFile.responseText
					this.setState({...this.state, filetext: filetext})
				}
			}
		}
		rawFile.send(null)*/
	}

	render() {
		return (
			<ScrollView style={styles.container} showVerticalScrollIndicator={false}>
				<Markdown style={styles.maintext}>{this.state.filetext}</Markdown>
			</ScrollView>
		);
	}

})

export default withNavigation(class Kindling extends React.Component {

	createDetail = (title, file) => {
		const item = <SettingsList.Item
			displayName='Item'
			itemWidth={50}
			title={title}
			titleStyle={{color: Colors.text}}
			onPress={() => this.props.navigation.push('kindling', {
				title: title,
				file: file
			})}
		/>;
		item.displayName = 'Item';
		return item;
	}

	createCustom = (title, navigation) => {
		const item = <SettingsList.Item
			displayName='Item'
			itemWidth={50}
			title={title}
			titleStyle={{color: Colors.text}}
			onPress={() => this.props.navigation.push(navigation, {
				uid: this.props.uid,
				logout: this.props.logout,
			})}
		/>;
		item.displayName = 'Item';
		return item;
	}

	createHeader = (title) => {
		const item = <SettingsList.Item
				  hasNavArrow={false}
				  title={title}
				  titleStyle={{color: Colors.fadedText, marginTop:10, fontWeight:'bold'}}
				  itemWidth={70}
				  borderHide={'Both'}
				/>;
		return item;
	}

	render() {
		return (
			<ScrollView>
				<Header
					title="Kindling"
				/>
			<View style={styles.container}>
				<SettingsList borderColor={Colors.text} backgroundColor={Colors.background}>
					{ this.createHeader('The Foundations') }
					{ this.createDetail('What is Ignite?', 'whatisignite') }
					{ this.createDetail('Guide to Community', 'guidetocommunity') }
					{ this.createDetail('Guide to Fasting', 'guidetofasting') }
					{ this.createDetail('Guide to Prayer', 'guidetoprayer') }
					{ this.createDetail('Meeting Guide', 'meetingguide') }
					{ this.createHeader('Helpful Resources') }
					{ this.createDetail('Why should I do Ignite?', 'whyignite') }
					{ this.createDetail('How to prepare for Ignite', 'prepareforignite') }
					{ this.createHeader('Settings') }
					{ this.createCustom('Edit Suscipe', 'suscipe') }
					{ this.createCustom('Account', 'account') }
					{ /* this.createDetail('Dark Mode', 'whatisignite') */ }
					{ this.createHeader('About') }
					{ this.createDetail('Attributions', 'attributions') }
				</SettingsList>
			</View>
			</ScrollView>
		);
	}

})

export { KindlingDetail, Suscipe, Account };

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.background,
		padding: 10,
		paddingRight: 20,
		marginBottom: 40,
	},
	maintext: {
		color: Colors.text,
	},
});
