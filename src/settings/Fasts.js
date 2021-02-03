import React from "react";
import {withNavigation} from "react-navigation";
import IgniteHelper from "../IgniteHelper";
import FastList from "../FastList";
import LoadingScreen from "../LoadingScreen";

export default withNavigation(
  class Fasts extends React.Component {
    static navigationOptions = ({navigation}) => {
      return {
        headerMode: "float",
        headerBackTitleVisible: true,
        title: "Edit Fasts",
      };
    };

    constructor(props) {
      super(props);

      const {navigation} = this.props;
      const {params} = navigation.state;

      this.state = {uid: params.uid, user: null};
    }

    async componentDidMount() {
      const {uid} = this.state;

      const user = await IgniteHelper.api("user", `action=getu&uid=${uid}`);
      this.setState({user});
    }

    onSave = () => {
      const {navigation} = this.props;

      navigation.goBack();
    };

    render() {
      const {user} = this.state;

      if (!user) {
        return <LoadingScreen />;
      }

      return <FastList user={user} onSave={this.onSave} />;
    }
  }
);
