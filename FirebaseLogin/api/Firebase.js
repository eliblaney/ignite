import Reactotron from "reactotron-react-native";
import auth from "@react-native-firebase/auth";
import IgniteHelper from "../../src/IgniteHelper.js";

class Firebase {
  userLogin = (email, password, onError, onLogin) => {
    return new Promise(resolve => {
      auth()
        .signInWithEmailAndPassword(email, password)
        .catch(error => {
          onError(error.code);
          resolve(null);
        })
        .then(user => {
          if (user) {
            // onLogin(user.user);
            resolve(user);
          }
        });
    });
  };

  createFirebaseAccount = (
    name,
    email,
    password,
    faith,
    onError,
    onRegister
  ) => {
    const success = new Promise(resolve => {
      auth()
        .createUserWithEmailAndPassword(email, password)
        .catch(error => {
          onError(error.code);
          resolve(false);
        })
        .then(async info => {
          if (info) {
            const user = auth().currentUser;
            user.updateProfile({
              displayName: name,
            });
            const {uid, email} = user;
            const now = new Date();
            const query = `uid=${uid}&email=${encodeURIComponent(
              email
            )}&name=${encodeURIComponent(
              name
            )}&faith=${faith}&createdAt=${encodeURIComponent(
              now.toISOString()
            )}`;
            await IgniteHelper.api("register", query);
            //			onRegister(user);
            resolve(true);
          }
        });
    });
    return success;
  };

  sendEmailWithPassword = (email, onError) => {
    return new Promise(resolve => {
      auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          resolve(true);
        })
        .catch(error => {
          onError(error.code);
          resolve(false);
        });
    });
  };
}

export default new Firebase();
