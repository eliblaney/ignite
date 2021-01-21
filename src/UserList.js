import React from "react";
import {StyleSheet, View} from "react-native";
import {Card, ListItem, Avatar} from "react-native-elements";
import AwesomeAlert from "react-native-awesome-alerts";
import Colors from "./Colors";

export default class UserList extends React.Component {
  constructor() {
    super();
    this.state = {
      userDetails: false,
    };
  }

  initials = name => {
    if (name.length < 2) {
      return name[0].toUppercase();
    }
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  render() {
    const {style, title, users} = this.props;
    const {userDetails} = this.state;

    return (
      <View>
        <Card
          containerStyle={[{backgroundColor: Colors.modalBackground}, style]}
          wrapperStyle={{backgroundColor: Colors.modalBackground}}
          title={title}
          titleStyle={{color: Colors.modalText}}
        >
          {users.map((u, i) => {
            const word =
              u.word !== undefined && u.word !== null
                ? `is feeling ${u.word.substring(u.word.indexOf("|") + 1)}`
                : null;
            return (
              <ListItem
                key={u.uid}
                roundAvatar
                title={u.name}
                leftAvatar={
                  <Avatar
                    rounded
                    title={this.initials(u.name)}
                    overlayContainerStyle={styles.avatar}
                  />
                }
                containerStyle={{backgroundColor: Colors.modalBackground}}
                titleStyle={{color: Colors.modalText}}
                subtitle={word}
                subtitleStyle={{color: Colors.fadedText, fontSize: 12}}
                onPress={() => this.setState({userDetails: u})}
              />
            );
          })}
        </Card>
        <AwesomeAlert
          show={userDetails}
          showProgress={false}
          title={userDetails ? userDetails.name : ""}
          message={userDetails ? userDetails.email : ""}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Close"
          confirmButtonColor={Colors.fadedText}
          onConfirmPressed={() => this.setState({userDetails: false})}
          overlayStyle={{
            top: -255,
          }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.primary,
  },
});
