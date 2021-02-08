import React from "react";
import {withNavigation} from "react-navigation";
import {Platform, View, TextInput} from "react-native";
import {Button} from "react-native-elements";
import IgniteConfig from "../../config/IgniteConfig";
import IgniteHelper from "../IgniteHelper";

export default withNavigation(
  class Suscipe extends React.Component {
    static navigationOptions = ({navigation}) => {
      return {
        headerMode: "float",
        headerBackTitleVisible: Platform.OS === "ios",
        title: "Edit Suscipe",
      };
    };

    constructor(props) {
      super(props);

      const {navigation} = this.props;
      const {params} = navigation.state;
      this.setSuscipe = params.setSuscipe;
      this.state = {uid: params.uid, suscipe: ""};
    }

    async componentDidMount() {
      const {uid} = this.state;

      const user = await IgniteHelper.api("user", `action=getu&uid=${uid}`);
      const {suscipe} = user;
      if (suscipe !== null) {
        this.setState({
          suscipe: IgniteHelper.decrypt(suscipe, true),
        });
      }
    }

    pushSuscipe = async suscipeText => {
      const {uid} = this.state;
      const {navigation} = this.props;
      await IgniteHelper.api(
        "user",
        `action=susc&uid=${encodeURI(uid)}&data=${encodeURI(
          IgniteHelper.encrypt(suscipeText, true)
        )}`
      );
      this.setSuscipe(suscipeText);
      navigation.goBack();
    };

    render() {
      const {suscipe} = this.state;

      return (
        <View style={{flex: 1, flexDirection: "column"}}>
          <TextInput
            style={{
              margin: 10,
              height: 200,
              borderColor: "gray",
              borderWidth: 1,
            }}
            multiline={true}
            numberofLines={8}
            onChangeText={text => this.setState({suscipe: text})}
            value={suscipe}
          />
          <Button
            onPress={async () => {
              let suscipeText = suscipe;
              if (!suscipe || suscipe.length < 1) {
                suscipeText = IgniteConfig.suscipe;
              }
              this.pushSuscipe(suscipeText);
            }}
            title="Save"
            type="solid"
            titleStyle={{fontSize: 16}}
            buttonStyle={{margin: 10, backgroundColor: "#228822"}}
          />
          <Button
            onPress={async () => this.pushSuscipe(IgniteConfig.suscipe)}
            title="Reset to default"
            type="solid"
            titleStyle={{fontSize: 16}}
            buttonStyle={{margin: 10, backgroundColor: "#888888"}}
          />
        </View>
      );
    }
  }
);
