import React from "react";
import {StyleSheet, TouchableOpacity} from "react-native";
import {Avatar, ListItem} from "react-native-elements";
import IgniteHelper from "./IgniteHelper";
import Colors from "./Colors";

export default class PostElement extends React.PureComponent {
  constructor(props) {
    super(props);
    this.props = props;
  }

  truncate = post => {
    const {previewWordLimit} = this.props;

    const words = previewWordLimit;
    let suffix = "";
    const p = post
      .replace(/(\r\n|\n|\r)/gm, " ")
      .trim()
      .replace(/ +/g, " ")
      .split(" ");
    if (p.length > words) {
      suffix = "...";
    }

    let truncated = p.splice(0, words).join(" ");
    if (truncated.length > 32) {
      suffix = "...";
      truncated = truncated.substring(0, 32).trim();
    }
    return truncated + suffix;
  };

  render() {
    const {id, post, user, openPost, owner} = this.props;

    let preview;
    try {
      preview = this.truncate(
        IgniteHelper.decrypt(post.data, post.privacy === "0")
      );
    } catch (e) {
      return null;
    }

    return (
      <TouchableOpacity key={id} onPress={() => openPost(post, user, owner)}>
        <ListItem
          key={id}
          roundAvatar
          title={`${owner ? "You" : user.name}, ${IgniteHelper.movementText(
            IgniteHelper.getMovement(post.day)
          )}`}
          subtitle={preview}
          leftAvatar={
            <Avatar
              rounded
              title={IgniteHelper.initials(user.name)}
              overlayContainerStyle={styles.avatar}
            />
          }
          containerStyle={{backgroundColor: Colors.modalBackground}}
          titleStyle={{color: Colors.fadedText, fontSize: 13}}
          subtitleStyle={{color: Colors.modalText, fontSize: 14}}
          chevron={true}
        />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.primary,
  },
});
