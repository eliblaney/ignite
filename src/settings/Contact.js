import React from "react";
import {withNavigation} from "react-navigation";
import {StyleSheet, Text, View} from "react-native";
import {Button, Input} from "react-native-elements";
import AwesomeAlert from "react-native-awesome-alerts";
import IgniteHelper from "../IgniteHelper";
import Colors from "../Colors";

export default withNavigation(
  class Contact extends React.Component {
    static navigationOptions = ({navigation}) => {
      return {
        headerMode: "float",
        headerBackTitleVisible: true,
        title: "Contact Us",
      };
    };

    constructor(props) {
      super(props);

      const {navigation} = this.props;
      const {params} = navigation.state;
      this.setSuscipe = params.setSuscipe;
      this.state = {
        uid: params.uid,
        subject: "",
        message: "",
        error: 0,
        sent: false,
      };
    }

    sendMessage = async () => {
      const {uid, subject, message} = this.state;
      let error = 0;
      if (!subject || subject.length === 0) {
        error |= 2;
      }
      if (!message || message.length === 0) {
        error |= 1;
      }
      if (error > 0) {
        this.setState({error});
        return;
      }
      const result = await IgniteHelper.api(
        "user",
        `action=cont&uid=${encodeURI(uid)}&subject=${encodeURI(
          subject
        )}&message=${encodeURI(message)}`
      );
      this.setState({
        error: 0,
        sent:
          result.success === "1"
            ? true
            : "Something went wrong. Please check your internet and try again.",
      });
    };

    render() {
      const {navigation} = this.props;
      const {subject, message, error, sent} = this.state;

      return (
        <View style={{flex: 1, flexDirection: "column"}}>
          <Text style={styles.introText}>
            Have questions? Feedback? Simply fill out the form below to reach
            out to us!
          </Text>
          <Input
            inputStyle={{
              margin: 10,
            }}
            multiline={false}
            numberofLines={1}
            onChangeText={text => this.setState({subject: text})}
            errorStyle={{color: "red"}}
            errorMessage={error & 2 ? "You must enter a subject." : ""}
            placeholder="Subject"
            value={subject}
          />
          <Input
            inputStyle={{
              margin: 10,
              height: 250,
            }}
            multiline={true}
            numberofLines={8}
            onChangeText={text => this.setState({message: text})}
            errorStyle={{color: "red"}}
            errorMessage={error & 1 ? "You must enter a message." : ""}
            placeholder="Write your message here!"
            value={message}
          />
          <Button
            onPress={this.sendMessage}
            title="Send Message"
            type="solid"
            titleStyle={{fontSize: 16}}
            buttonStyle={{margin: 10, backgroundColor: "#228822"}}
          />
          <AwesomeAlert
            show={sent === true}
            showProgress={false}
            title="Success!"
            message="Your message was sent successfully."
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={true}
            showCancelButton={false}
            showConfirmButton={true}
            confirmText="Okay!"
            confirmButtonColor="#228822"
            onConfirmPressed={() => {
              this.setState({sent: false});
              navigation.goBack();
            }}
            onDismiss={navigation.goBack}
          />
          <AwesomeAlert
            // sent may be written with an error message
            show={sent && sent !== true}
            showProgress={false}
            title="Error"
            message={sent}
            closeOnTouchOutside={true}
            closeOnHardwareBackPress={true}
            showCancelButton={false}
            showConfirmButton={true}
            confirmText="Okay"
            confirmButtonColor="#222222"
            onConfirmPressed={() => {
              this.setState({sent: false});
            }}
            onDismiss={() => {
              this.setState({sent: false});
            }}
          />
        </View>
      );
    }
  }
);

const styles = StyleSheet.create({
  introText: {
    color: Colors.text,
    margin: 20,
  },
});
