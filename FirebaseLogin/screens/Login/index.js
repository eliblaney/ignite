import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Image} from 'react-native';
import InputField from "../../components/InputField";
import {w, h, totalSize} from '../../api/Dimensions';
import GetStarted from './GetStarted';
import Firebase from '../../api/Firebase';
import AwesomeAlert from 'react-native-awesome-alerts';

//const companyLogo = require('../../assets/companylogo.png');
const email = require('../../assets/email.png');
const password = require('../../assets/password.png');

export default class Login extends Component {

  state = {
    isEmailCorrect: false,
    isPasswordCorrect: false,
    isLogin: false,
	showError: false,
	errorMessage: null,
  };

  loginError = (errorCode) => {
	  var message = "Sorry, an error has occurred. Please try again.";
	  switch (errorCode) {
		case 'auth/invalid-email':
		  message = "Invalid email address format.";
		  break;
		case 'auth/user-not-found':
		case 'auth/wrong-password':
		  message = "Invalid email address or password";
		  break;
		default:
		  message = "Check your internet connection";
	  }
	  this.setState({...this.state, showError: true, errorMessage: message});
  };

  getStarted = () => {
    const email = this.email.getInputValue();
    const password = this.password.getInputValue();

    this.setState({
      isEmailCorrect: email === '',
      isPasswordCorrect: password === '',
    }, () => {
      if(email !== '' && password !== ''){
        this.loginToFireBase(email, password);
      } else {
        var message = "Fill up all fields";
	  	this.setState({...this.state, showError: true, errorMessage: message});
      }
    });
  };

  changeInputFocus = name => () => {
    if (name === 'Email') {
      this.setState({ isEmailCorrect: this.email.getInputValue() === '' });
      this.password.input.focus();
    } else {
      this.setState({ isPasswordCorrect: this.password.getInputValue() === '' });
    }
  };

  loginToFireBase = (email, password) => {
    this.setState({ isLogin: true });
    Firebase.userLogin(email, password, this.loginError.bind(this), this.props.onLogin)
      .then(user => {
        if(user) this.props.success(user);
        this.setState({ isLogin: false });
      });
  };

  render() {
    return (
      <View style={styles.container}>
		{ /* <Image style={styles.icon} resizeMode="contain" source={companyLogo}/> */ }
		<Text style={styles.brandText}>Ignite</Text>
        <InputField
          placeholder="Email"
          keyboardType="email-address"
          style={styles.email}
          error={this.state.isEmailCorrect}
          focus={this.changeInputFocus}
          ref={ref => this.email = ref}
          icon={email}
        />
        <InputField
          placeholder="Password"
          returnKeyType="done"
          secureTextEntry={true}
          blurOnSubmit={true}
          error={this.state.isPasswordCorrect}
          ref={ref => this.password = ref}
          focus={this.changeInputFocus}
          icon={password}
        />
        <GetStarted
          click={this.getStarted}
          isLogin={this.state.isLogin}
        />
        <View style={styles.textContainer}>
          <TouchableOpacity onPress={this.props.change('register')} style={styles.touchable} activeOpacity={0.6}>
            <Text style={styles.createAccount}>Create Account</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={this.props.change('forgot')} style={styles.touchable} activeOpacity={0.6}>
            <Text style={styles.forgotPassword}>Forgot Password</Text>
          </TouchableOpacity>
        </View>
		<AwesomeAlert show={this.state.showError} showProgress={false} title="Error" message={this.state.errorMessage} closeOnTouchOutside={true} closeOnHardwareBackPress={true} showCancelButton={false} showConfirmButton={true} confirmText="Okay" confirmButtonColor="#DD6B55" onConfirmPressed={() => {this.setState({...this.state, showError: false});}} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: w(70),
    height: h(30),
    marginTop: h(10),
//    marginBottom: h(7),
  },
  textContainer: {
    width: w(100),
    flexDirection: 'row',
    marginTop: h(5),
  },
  email: {
    marginBottom: h(4.5),
  },
  touchable: {
    flex: 1,
  },
  createAccount: {
    color:'#ffffffEE',
    textAlign: 'center',
    fontSize: totalSize(2),
    fontWeight: '600',
  },
  forgotPassword: {
    color:'#ffffffEE',
    textAlign: 'center',
    fontSize: totalSize(2),
    fontWeight: '600',
  },
  brandText: {
	  color: "#ffffee",
	  fontSize: totalSize(6),
	  fontWeight: '600',
	  marginBottom: 20,
  }
});
