import React from "react";
import {View, Text, StyleSheet} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {Button, Input, Icon, CheckBox} from "react-native-elements";
import AwesomeAlert from "react-native-awesome-alerts";
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
      inputEditable: true,
      error: null,
      publicChecked: true,
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
      });
    } else {
      this.setState({
        screen: 1,
        inputEditable: true,
        error: "Couldn't find community. Please try again.",
      });
    }
  };

  joinCommunity = async () => {
    const {community} = this.state;

    if (community === undefined) {
      this.setState({
        screen: 2,
        inputEditable: true,
        error: "Invalid community",
      });
      return;
    }

    const errorCode = await this.doJoinCommunity(community);
    if (errorCode) {
      if (errorCode === "42") {
        // Too many members
        this.setState({
          screen: 2,
          inputEditable: true,
          error: "This community is full.",
        });
      } else {
        // Other error
        this.setState({
          screen: 3,
          inputEditable: true,
          error: `Sorry, something went wrong. Please check your internet and try again. [Error ${errorCode}]`,
        });
      }
    }
  };

  doJoinCommunity = async community => {
    const {onCommunity, uid} = this.props;

    const c = await IgniteHelper.api(
      "community",
      `action=join&id=${community.id}&user=${uid}`
    );

    if (c.success === "1") {
      onCommunity(c.id);
      return 0;
    } else {
      const errorCode = c.error;
      return errorCode;
    }
  };

  createCommunity = async () => {
    const {communityName, publicChecked} = this.state;
    const {onCommunity, uid} = this.props;

    let cName = encodeURI(communityName);
    if (cName === undefined || cName === "undefined" || cName.length === 0) {
      return;
    }

    // Encode whether the community is public or not
    if (publicChecked) {
      cName = `P${cName}`;
    } else {
      cName = `R${cName}`;
    }

    this.setState({inputEditable: false});

    const c = await IgniteHelper.api(
      "community",
      `action=init&name=${cName}&user=${uid}`
    );
    if (c.success === "1") {
      onCommunity(c.id);
    } else {
      this.setState({
        screen: 2,
        inputEditable: true,
        error: `An error occurred when making your community. Please check your internet and try again. [Error ${c.error}]`,
      });
    }
  };

  selectSuitableCommunity = cs => {
    // TODO: More intelligent matching algorithm
    return cs[Math.floor(Math.random() * cs.length)];
  };

  findMatch = async () => {
    const communities = await IgniteHelper.api("community", "action=getp");
    if (communities.success === "1" && communities.num > 0) {
      const c = this.selectSuitableCommunity(communities.communities);
      const errorCode = await this.doJoinCommunity(c);
      if (errorCode) {
        this.setState({
          screen: 4,
          error: `Sorry, something went wrong. Please check your internet and try again. [Error ${errorCode}]`,
        });
      }
    } else {
      this.setState({
        screen: 0,
        error: "There were no available communities :(",
      });
    }
  };

  render() {
    const {screen, inputEditable, community, error, publicChecked} = this.state;

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
            <Text style={styles.smalltext}>Don&apos;t know who to join?</Text>
            <Button
              onPress={() => this.setState({screen: 4})}
              raised
              title="Match Me!"
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
            <AwesomeAlert
              show={error !== null && error !== undefined}
              showProgress={false}
              title="Error"
              message={error}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="Okay"
              confirmButtonColor="#DD6B55"
              onConfirmPressed={() => this.setState({error: null})}
            />
          </LinearGradient>
        );
      case 1:
        return (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
            <Input
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
            <AwesomeAlert
              show={error !== null && error !== undefined}
              showProgress={false}
              title="Error"
              message={error}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="Okay"
              confirmButtonColor="#DD6B55"
              onConfirmPressed={() => this.setState({error: null})}
            />
          </LinearGradient>
        );
      case 2:
        return (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
            <Input
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
            <CheckBox
              center
              editable={inputEditable}
              title="Private"
              containerStyle={styles.checkStyle}
              textStyle={styles.inputTextStyle}
              checkedColor={Colors.secondaryText}
              uncheckedColor={Colors.secondaryText}
              checked={!publicChecked}
              onPress={() => this.setState({publicChecked: !publicChecked})}
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
            <AwesomeAlert
              show={error !== null && error !== undefined}
              showProgress={false}
              title="Error"
              message={error}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="Okay"
              confirmButtonColor="#DD6B55"
              onConfirmPressed={() => this.setState({error: null})}
            />
          </LinearGradient>
        );
      case 3:
        return (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
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
            <AwesomeAlert
              show={error !== null && error !== undefined}
              showProgress={false}
              title="Error"
              message={error}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="Okay"
              confirmButtonColor="#DD6B55"
              onConfirmPressed={() => this.setState({error: null})}
            />
          </LinearGradient>
        );
      case 4:
        return (
          <LinearGradient
            colors={[Colors.primary, Colors.secondary]}
            style={[styles.container, styles.gradientBackground]}
          >
            <View style={styles.confirmCommunityView}>
              <Text style={styles.confirmTitle}>Confirm</Text>
              <Text style={[{textAlign: "center"}, styles.confirmDesc]}>
                This will pair you up with a compatible community. Is that okay?
              </Text>
              <View style={styles.confirmButtonView}>
                <Button
                  onPress={() => this.setState({screen: 0})}
                  raised
                  title="Cancel"
                  type="clear"
                  buttonStyle={styles.outlineButton}
                  titleStyle={styles.outlineText}
                />
                <Button
                  onPress={() => this.findMatch()}
                  raised
                  title="Yes!"
                  type="solid"
                  buttonStyle={[styles.solidButton, {padding: 10}]}
                />
              </View>
            </View>
            <AwesomeAlert
              show={error !== null && error !== undefined}
              showProgress={false}
              title="Error"
              message={error}
              closeOnTouchOutside={true}
              closeOnHardwareBackPress={false}
              showCancelButton={false}
              showConfirmButton={true}
              confirmText="Okay"
              confirmButtonColor="#DD6B55"
              onConfirmPressed={() => this.setState({error: null})}
            />
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
    marginBottom: 30,
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
    zIndex: 1,
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
    marginBottom: 10,
  },
  checkStyle: {
    width: 250,
    marginBottom: 30,
    backgroundColor: "rgba(0, 0, 0, 0)",
    borderColor: "rgba(0, 0, 0, 0)",
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
});
