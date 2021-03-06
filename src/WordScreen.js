import React from "react";
import {KeyboardAvoidingView, Text, StyleSheet} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {Button} from "react-native-elements";
import SearchableDropdown from "react-native-searchable-dropdown";
import Colors from "./Colors";

export default class WordScreen extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {headerShown: false};
  };

  constructor(props) {
    super(props);

    this.maxLength = 14;
    const itemList = [
      "amazed",
      "annoyed",
      "anxious",
      "awesome",
      "bored",
      "buzzing",
      "crazy",
      "daring",
      "down",
      "energized",
      "exhausted",
      "frightened",
      "grateful",
      "hopeful",
      "hyped",
      "optimistic",
      "pessimistic",
      "prayerful",
      "ready",
      "reflective",
      "relaxed",
      "rushed",
      "satisfied",
      "scared",
      "sleepy",
      "sore",
      "tired",
      "wonderful",
      "worried",
    ];

    this.items = itemList.map((name, i) => {
      return {id: i, name};
    });

    const {placeholder} = this.props;

    this.placeholder = placeholder || "Type anything!";
    this.state = {
      inputText: "",
    };
  }

  next = () => {
    const {onNext} = this.props;
    const {inputText} = this.state;

    if (inputText.length > 0) {
      onNext(inputText);
    }
  };

  render() {
    return (
      <KeyboardAvoidingView behavior="height" style={{flex: 1}}>
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={[styles.container, styles.gradientBackground]}
        >
          <Text style={styles.text}>Hello</Text>
          <Text style={[styles.smalltext, styles.subtitle]}>
            How do you feel today?
          </Text>
          <Text style={styles.smalltext}>I feel...</Text>
          <SearchableDropdown
            onTextChange={text => this.setState({inputText: text})}
            onItemSelect={text => this.setState({inputText: text.name})}
            containerStyle={{
              marginBottom: 50,
              backgroundColor: Colors.modalBackground,
              padding: 5,
            }}
            textInputStyle={{
              padding: 5,
              backgroundColor: Colors.modalBackground,
              color: Colors.modalText,
            }}
            itemStyle={{
              padding: 5,
              marginTop: 2,
              backgroundColor: Colors.modalBackground,
            }}
            itemTextStyle={{color: Colors.modalText}}
            itemsContainerStyle={{maxHeight: 150}}
            items={this.items}
            textInputProps={{autoCapitalize: "none", maxLength: this.maxLength}}
            placeholder={this.placeholder}
            placeholderTextColor={Colors.fadedText}
            resetValue={false}
            underlineColorAndroid="transparent"
          />
          <Button
            onPress={this.next}
            title="Next"
            type="outline"
            titleStyle={styles.outlineText}
            buttonStyle={styles.outlineButton}
          />
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
  text: {
    color: Colors.primaryText,
    fontSize: 64,
    marginTop: -100,
  },
  subtitle: {
    marginTop: 10,
    marginBottom: 100,
  },
  smalltext: {
    color: Colors.secondaryText,
    fontSize: 18,
    marginTop: 48,
    marginBottom: 18,
  },
  outlineButton: {
    borderColor: Colors.primaryText,
    padding: 10,
    marginBottom: 50,
  },
  outlineText: {
    color: Colors.primaryText,
  },
});
