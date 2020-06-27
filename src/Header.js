import React from "react";
import {StyleSheet} from "react-native";
import {Header as ElementsHeader} from "react-native-elements";
import Colors from "./Colors";

export default class Header extends React.Component {
  render() {
    const {title, titleStyle, left, right} = this.props;

    return (
      <ElementsHeader
        barStyle="light-content"
        containerStyle={styles.header}
        centerComponent={{
          text: title,
          style: [styles.title, titleStyle],
        }}
        leftComponent={left}
        rightComponent={right}
      />
    );
  }
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.primary,
    justifyContent: "space-around",
  },
  title: {
    fontSize: 24,
    color: Colors.primaryText,
  },
});
