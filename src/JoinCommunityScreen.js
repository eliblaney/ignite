import React from "react";
import {View, Text, StyleSheet} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {Button, Input, Icon} from "react-native-elements";
import Colors from "./Colors";
import IgniteHelper from "./IgniteHelper";

export default class JoinCommunityScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {headerShown: false};
  };

  constructor() {
    super();
    this.state = {
      screen: 0, // 0: Welcome, 1: Find Community, 2: Create Community, 3: Confirm Join Community
      inputShake: false,
      inputEditable: true,
    };
  }

  findCommunity = async () => {
    const {communityCode} = this.state;

    if (communityCode === undefined || communityCode.length === 0) return;

    this.setState({inputEditable: false});
    const joincode = communityCode.replace(/[^A-Z0-9]+$/gi, "");
    const community = await IgniteHelper.api(
      "community",
      `action=getj&joincode=${joincode}`
    );
    if (community.success === "1") {
      this.setState({
        screen: 3,
        community,
        inputEditable: true,
        inputShake: false,
      });
    } else {
      this.setState({
        screen: 1,
        inputEditable: true,
        inputShake: false,
      });
    }
  };

  joinCommunity = async () => {
    const {community} = this.state;
    const {onCommunity, uid} = this.props;

    if (community === undefined) {
      return;
    }

    const c = await IgniteHelper.api(
      "community",
      `action=join&id=${community.id}&user=${uid}`
    );

    if (c.success === "1") {
      onCommunity(c.id);
    } else {
      this.setState({
        screen: 3,
        inputEditable: true,
        inputShake: true,
      });
    }
  };

  createCommunity = async () => {
    const {communityName} = this.state;
    const {reauth, uid} = this.props;

    const cName = encodeURI(communityName);
    if (cName === undefined || cName.length === 0) {
      return;
    }
    this.setState({inputEditable: false});

    IgniteHelper.api("community", `action=init&name=${cName}&user=${uid}`);
    // if (c.success === '1') {
    // onCommunity(c.id);
    reauth();
    /* } else {
			this.setState({screen: 2, inputEditable: true, inputShake: true});
		} */
  };

  render() {
    const {screen, inputShake, inputEditable, community} = this.state;

    switch (screen) {
      default:
      case 0:
        return (
          <LinearGradient
            colors={[Colors.primary, /* "#fff", */ Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
            <Text style={styles.text}>Welcome</Text>
            <Text style={[styles.smalltext, styles.subtitle]}>
              Join a community to get started
            </Text>
            <Button
              onPress={() => this.setState({screen: 1})}
              raised
              title="Find Community"
              type="solid"
              buttonStyle={styles.solidButton}
            />
            <Text style={styles.smalltext}>First one in your group?</Text>
            <Button
              onPress={() => this.setState({screen: 2})}
              raised
              title="Create Community"
              type="outline"
              titleStyle={styles.outlineText}
              buttonStyle={styles.outlineButton}
            />
          </LinearGradient>
        );
      case 1:
        return (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
            {inputShake && (
              <Text style={[styles.outlineText, styles.errorText]}>
                Sorry, no community was found. Try again?
              </Text>
            )}
            <Input
              shake={inputShake}
              editable={inputEditable}
              autoCapitalize="characters"
              maxLength={6}
              autoCorrect={false}
              onChangeText={value => this.setState({communityCode: value})}
              placeholder="Enter code"
              leftIcon={
                <Icon
                  color={Colors.secondaryText}
                  type="font-awesome"
                  name="chevron-right"
                />
              }
              containerStyle={styles.inputStyle}
              inputStyle={styles.inputTextStyle}
            />
            <Button
              onPress={this.findCommunity}
              raised
              title="Find Community"
              type="solid"
              buttonStyle={styles.solidButton}
            />
            <Button
              onPress={() => this.setState({screen: 0})}
              title="Go back"
              type="clear"
              titleStyle={{color: Colors.secondaryText}}
            />
          </LinearGradient>
        );
      case 2:
        return (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
            {inputShake && (
              <Text style={[styles.outlineText, styles.errorText]}>
                Sorry, an error occurred. Please check your internet connection
                and try again.
              </Text>
            )}
            <Input
              shake={inputShake}
              editable={inputEditable}
              autoCapitalize="words"
              maxLength={32}
              onChangeText={value => this.setState({communityName: value})}
              placeholder="Community name"
              leftIcon={
                <Icon
                  color={Colors.secondaryText}
                  type="font-awesome"
                  name="chevron-right"
                />
              }
              containerStyle={styles.inputStyle}
              inputStyle={styles.inputTextStyle}
            />
            <Button
              onPress={this.createCommunity}
              raised
              title="Create Community"
              type="solid"
              buttonStyle={styles.solidButton}
            />
            <Button
              onPress={() => this.setState({screen: 0})}
              title="Go back"
              type="clear"
              titleStyle={{color: Colors.secondaryText}}
            />
          </LinearGradient>
        );
      case 3:
        return (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
            {inputShake && (
              <Text style={[styles.outlineText, styles.errorText]}>
                Sorry, an error occurred. Please check your internet connection
                and try again.
              </Text>
            )}
            <View style={styles.confirmCommunityView}>
              <Text style={styles.confirmTitle}>Confirm</Text>
              <Text style={styles.confirmDesc}>
                Are you sure you want to join this community?
              </Text>
              <Text style={styles.confirmDesc}>{community.name}</Text>
              <View style={styles.confirmButtonView}>
                <Button
                  onPress={() => this.setState({screen: 1})}
                  raised
                  title="Go back"
                  type="clear"
                  buttonStyle={styles.outlineButton}
                  titleStyle={styles.outlineText}
                />
                <Button
                  onPress={this.joinCommunity}
                  raised
                  title="Yes, join!"
                  type="solid"
                  buttonStyle={[styles.solidButton, {padding: 10}]}
                />
              </View>
            </View>
          </LinearGradient>
        );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  text: {
    color: Colors.primaryText,
    fontSize: 64,
    marginTop: -100,
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 100,
  },
  smalltext: {
    color: Colors.secondaryText,
    fontSize: 18,
    marginTop: 48,
    marginBottom: 18,
  },
  solidButton: {
    backgroundColor: Colors.tertiary,
    padding: 15,
  },
  outlineButton: {
    borderColor: Colors.tertiary,
    padding: 10,
  },
  outlineText: {
    color: Colors.tertiary,
  },
  inputStyle: {
    width: 250,
    marginBottom: 30,
  },
  inputTextStyle: {
    color: Colors.primaryText,
    marginLeft: 15,
  },
  confirmCommunityView: {
    backgroundColor: Colors.modalBackground,
    borderRadius: 15,
    padding: 10,
    margin: 10,
    width: "90%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  confirmTitle: {
    fontSize: 30,
    color: Colors.modalText,
    marginBottom: 5,
  },
  confirmDesc: {
    fontSize: 16,
    color: Colors.modalText,
    marginBottom: 15,
  },
  confirmButtonView: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  errorText: {
    color: Colors.secondaryText,
    marginTop: -75,
    marginBottom: 50,
  },
});
