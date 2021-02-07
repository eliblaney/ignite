import React, {Component} from "react";
import PropTypes from "prop-types";
import {KeyboardAvoidingView, StyleSheet} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Login from "./screens/Login";
import Register from "./screens/Register";
import ForgotPassword from "./screens/ForgotPassword";
import {w} from "./api/Dimensions";
import Colors from "../src/Colors.js";

export default class FirebaseLogin extends Component {
  static navigationOptions = ({navigation}) => {
    return {header: null};
  };

  state = {
    currentScreen: "register", // can be: 'login' or 'register' or 'forgot'
  };

  changeScreen = screenName => () => {
    this.setState({currentScreen: screenName});
  };

  userSuccessfullyLoggedIn = user => {
    this.props.login(user);
  };

  render() {
    let screenToShow;

    switch (this.state.currentScreen) {
      case "login":
        screenToShow = (
          <Login
            change={this.changeScreen}
            success={this.userSuccessfullyLoggedIn}
            onLogin={this.props.onAuth}
          />
        );
        break;
      case "register":
        screenToShow = (
          <Register change={this.changeScreen} onRegister={this.props.onAuth} />
        );
        break;
      case "forgot":
        screenToShow = <ForgotPassword change={this.changeScreen} />;
        break;
    }

    return (
      <KeyboardAvoidingView
        behavior="position"
        keyboardVerticalOffset={-w(40)}
        style={styles.container}
      >
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={[styles.container, styles.gradientBackground]}
        >
          {screenToShow}
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }
}

FirebaseLogin.propTypes = {
  login: PropTypes.func.isRequired,
};

FirebaseLogin.defaultProps = {
  background: null,
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "#555",
  },
  background: {
    width: "100%",
    height: "100%",
  },
  gradientBackground: {
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
});
