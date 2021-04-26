import React, {Component} from "react";
import PropTypes from "prop-types";
import {Platform, Text, StyleSheet, TouchableOpacity} from "react-native";
import {KeyboardAwareScrollView} from "react-native-keyboard-aware-scroll-view";
import {ButtonGroup} from "react-native-elements";
import AwesomeAlert from "react-native-awesome-alerts";
import {w, h, totalSize} from "../../api/Dimensions";
import InputField from "../../components/InputField";
import Continue from "./Continue";
import Firebase from "../../api/Firebase";
import Colors from "../../../src/Colors.js";

const email = require("../../assets/email.png");
const password = require("../../assets/password.png");
const repeat = require("../../assets/repeat.png");
const person = require("../../assets/person.png");

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.updateFaith = this.updateFaith.bind(this);
  }

  updateFaith(index) {
    this.setState({...this.state, faithIndex: index});
  }

  state = {
    isNameCorrect: false,
    isEmailCorrect: false,
    isPasswordCorrect: false,
    isRepeatCorrect: false,
    isCreatingAccount: false,
    faithIndex: 0,
    showError: false,
    errorMessage: null,
  };

  registerError = errorCode => {
    let message = "Sorry, an error has occurred. Please try again.";
    switch (errorCode) {
      case "auth/email-already-in-use":
        message = "This email address is already taken";
        break;
      case "auth/invalid-email":
        message = "Invalid e-mail address format";
        break;
      case "auth/weak-password":
        message = "Password is too weak";
        break;
      default:
        message = `Please check your internet connection and try again. [Error: ${errorCode}]`;
    }
    this.setState({...this.state, showError: true, errorMessage: message});
  };

  createUserAccount = () => {
    const name = this.name.getInputValue();
    const email = this.email.getInputValue();
    const password = this.password.getInputValue();
    const repeat = this.repeat.getInputValue();

    this.setState(
      {
        isNameCorrect: name === "",
        isEmailCorrect: email === "",
        isPasswordCorrect: password === "",
        isRepeatCorrect: repeat === "" || repeat !== password,
      },
      () => {
        if (
          name !== "" &&
          email !== "" &&
          password !== "" &&
          repeat !== "" &&
          repeat === password
        ) {
          if (
            name === null ||
            name.split(" ") === null ||
            name.split(" ").length <= 1 ||
            name.split(" ")[0].length < 1 ||
            name.split(" ")[1].length < 1
          ) {
            message = "Please use your full name";
            this.setState({
              ...this.state,
              showError: true,
              errorMessage: message,
            });
          } else {
            this.createFireBaseAccount(
              name,
              email,
              password,
              this.state.faithIndex
            );
          }
        } else {
          message = "Fill up all fields correctly";
          this.setState({
            ...this.state,
            showError: true,
            errorMessage: message,
          });
        }
      }
    );
  };

  createFireBaseAccount = (name, email, password, faith) => {
    this.setState({isCreatingAccount: true});
    Firebase.createFirebaseAccount(
      name,
      email,
      password,
      faith,
      this.registerError.bind(this),
      this.props.onRegister
    ).then(result => {
      if (result) this.props.change("login")();
      this.setState({isCreatingAccount: false});
    });
  };

  changeInputFocus = name => () => {
    switch (name) {
      case "Name":
        this.setState({isNameCorrect: this.name.getInputValue() === ""});
        this.email.input.focus();
        break;
      case "Email":
        this.setState({isEmailCorrect: this.email.getInputValue() === ""});
        this.password.input.focus();
        break;
      case "Password":
        this.setState({
          isPasswordCorrect: this.password.getInputValue() === "",
          isRepeatCorrect:
            this.repeat.getInputValue() !== "" &&
            this.repeat.getInputValue() !== this.password.getInputValue(),
        });
        this.repeat.input.focus();
        break;
      default:
        this.setState({
          isRepeatCorrect:
            this.repeat.getInputValue() === "" ||
            this.repeat.getInputValue() !== this.password.getInputValue(),
        });
    }
  };

  render() {
    const catholic = () => <Text>Catholic</Text>;
    const christian = () => <Text>Christian</Text>;
    const nonreligious = () => <Text>Nonreligious</Text>;
    const other = () => <Text>Other</Text>;
    const buttons = [
      {element: catholic},
      {element: christian},
      {element: nonreligious},
      {element: other},
    ];
    return (
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <Text style={styles.create}>CREATE ACCOUNT</Text>
        <InputField
          placeholder="Full Name"
          autoCapitalize="words"
          error={this.state.isNameCorrect}
          style={styles.input}
          focus={this.changeInputFocus}
          ref={ref => (this.name = ref)}
          icon={person}
        />
        <InputField
          placeholder="Email"
          keyboardType="email-address"
          error={this.state.isEmailCorrect}
          style={styles.input}
          focus={this.changeInputFocus}
          ref={ref => (this.email = ref)}
          icon={email}
        />
        <InputField
          placeholder="Password"
          error={this.state.isPasswordCorrect}
          style={styles.input}
          focus={this.changeInputFocus}
          ref={ref => (this.password = ref)}
          secureTextEntry={true}
          icon={password}
        />
        <InputField
          placeholder="Repeat Password"
          error={this.state.isRepeatCorrect}
          style={styles.input}
          secureTextEntry={true}
          returnKeyType="done"
          blurOnSubmit={true}
          focus={this.changeInputFocus}
          ref={ref => (this.repeat = ref)}
          icon={repeat}
        />
        {/* <ButtonGroup onPress={this.updateFaith} selectedIndex={this.state.faithIndex} buttons={buttons} containerStyle={{height: 50, backgroundColor: "transparent"}} buttonStyle={{backgroundColor: "transparent"}} /> */}
        <Continue
          isCreating={this.state.isCreatingAccount}
          click={this.createUserAccount}
        />
        <TouchableOpacity
          onPress={this.props.change("login")}
          style={styles.touchable}
        >
          <Text style={styles.signIn}>{"<"} Sign In</Text>
        </TouchableOpacity>
        <AwesomeAlert
          show={this.state.showError}
          showProgress={false}
          title="Error"
          message={this.state.errorMessage}
          closeOnTouchOutside={true}
          closeOnHardwareBackPress={true}
          showCancelButton={false}
          showConfirmButton={true}
          confirmText="Okay"
          confirmButtonColor="#DD6B55"
          onConfirmPressed={() => {
            this.setState({...this.state, showError: false});
          }}
        />
      </KeyboardAwareScrollView>
    );
  }
}

Register.propTypes = {
  change: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  create: {
    color: "white",
    fontSize: totalSize(2.4),
    marginTop: h(7),
    marginBottom: h(4),
    fontWeight: "700",
  },
  signIn: {
    color: "#ffffffEE",
    fontSize: totalSize(2),
    fontWeight: "700",
  },
  touchable: {
    alignSelf: "flex-start",
    marginLeft: w(8),
    marginTop: h(4),
  },
  input: {
    marginVertical: h(2),
  },
});
