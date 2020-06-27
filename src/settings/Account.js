import React from "react";
import {View} from "react-native";
import {Button} from "react-native-elements";
import {withNavigation} from "react-navigation";
import auth from "@react-native-firebase/auth";

export default withNavigation(
  class Account extends React.Component {
    static navigationOptions = ({navigation}) => {
      return {
        headerMode: "float",
        headerBackTitleVisible: true,
        title: "Edit Account",
      };
    };

    constructor(props) {
      super(props);

      const {navigation} = this.props;
      this.params = navigation.state.params;
    }

    logout = () => {
      const {navigation} = this.props;

      auth()
        .signOut()
        .then(() => {
          navigation.goBack();
          this.params.logout();
        });
    };

    render() {
      return (
        <View style={{flex: 1, flexDirection: "column"}}>
          <Button
            onPress={this.logout}
            title="Logout"
            type="solid"
            titleStyle={{fontSize: 16}}
            buttonStyle={{margin: 10, backgroundColor: "#dd2222"}}
          />
        </View>
      );
    }
  }
);
