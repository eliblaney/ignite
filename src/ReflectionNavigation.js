import React from "react";
import {StyleSheet} from "react-native";
import {Button} from "react-native-elements";
import Header from "./Header";
import Colors from "./Colors";

export default class ReflectionNavigation extends React.Component {
  constructor(props) {
    super(props);

    const {date, day} = this.props;
    this.state = {date, day};
  }

  move = pos => {
    if (pos < 0 && this.isFirst()) return;
    if (pos > 0 && this.isLast()) return;

    const {date, day} = this.state;
    const {onChange} = this.props;

    date.setDate(date.getDate() + pos);
    this.setState({day: day + pos});
    return onChange(date);
  };

  isFirst = () => {
    const {day} = this.state;

    return day <= 1;
  };

  isLast = () => {
    const {day} = this.state;
    const {isLent} = this.props;

    if (isLent) {
      return day >= 51;
    }
    return day >= 40;
  };

  isFuture = () => {
    const {date} = this.state;

    return date.getTime() + 24 * 60 * 60 * 1000 > Date.now();
  };

  render() {
    const {title} = this.props;

    return (
      <Header
        title={title}
        left={
          !this.isFirst() ? (
            <Button
              title="&lt;"
              titleStyle={styles.daynavArrow}
              type="clear"
              onPress={() => this.move(-1)}
            />
          ) : null
        }
        right={
          !this.isLast() && !this.isFuture() ? (
            <Button
              title="&gt;"
              titleStyle={styles.daynavArrow}
              type="clear"
              onPress={() => this.move(1)}
            />
          ) : null
        }
      />
    );
  }
}

const styles = StyleSheet.create({
  daynavArrow: {
    fontSize: 24,
    color: Colors.primaryText,
  },
});
