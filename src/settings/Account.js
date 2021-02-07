import React from "react";
import {View} from "react-native";
import {Button} from "react-native-elements";
import {withNavigation} from "react-navigation";
import auth from "@react-native-firebase/auth";
import AwesomeAlert from "react-native-awesome-alerts";
import Colors from "../Colors";
import IgniteHelper from "../IgniteHelper";

export default withNavigation(
  class Account extends React.Component {
    static navigationOptions = ({navigation}) => {
      return {
        headerMode: "float",
        headerBackTitleVisible: true,
        title: "Account",
      };
    };

    constructor(props) {
      super(props);

      const {navigation} = this.props;
      this.params = navigation.state.params;
      this.state = {
        showConfirmLeave: false,
      };
    }

    logout = () => {
      const {navigation} = this.props;

      auth()
        .signOut()
        .then(() => {
          navigation.goBack();
          this.params.reauth();
        });
    };

    leaveCommunity = async () => {
      const {navigation} = this.props;
      const {uid} = this.params;

      await IgniteHelper.api("user", `action=exit&uid=${uid}`);
      navigation.goBack();
      this.params.reauth();
    };

    render() {
      const {showConfirmLeave} = this.state;

      return (
        <View style={{flex: 1, flexDirection: "column"}}>
          <Button
            onPress={() => this.setState({showConfirmLeave: true})}
            title="Leave Community"
            type="solid"
            titleStyle={{fontSize: 16}}
            buttonStyle={{margin: 10, backgroundColor: "#dd2222"}}
          />
          <Button
            onPress={this.logout}
            title="Logout"
            type="solid"
            titleStyle={{fontSize: 16}}
            buttonStyle={{margin: 10, backgroundColor: "#dd2222"}}
          />
          <AwesomeAlert
            show={showConfirmLeave}
            showProgress={false}
            title="Leave Community"
            message="Are you sure you want to leave your community?"
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            confirmText="Okay"
            confirmButtonColor="#DD6B55"
            cancelButtonColor={Colors.fadedText}
            onConfirmPressed={this.leaveCommunity}
            onCancelPressed={() => this.setState({showConfirmLeave: false})}
          />
        </View>
      );
    }
  }
);
