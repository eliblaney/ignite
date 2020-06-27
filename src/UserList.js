import React from "react";
import {StyleSheet} from "react-native";
import {Card, ListItem, Avatar} from "react-native-elements";
import Colors from "./Colors";

export default class UserList extends React.Component {
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

    return (
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
            />
          );
        })}
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.primary,
  },
});
