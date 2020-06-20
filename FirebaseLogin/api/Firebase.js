import auth from "@react-native-firebase/auth";
import IgniteHelper from "../../src/IgniteHelper.js";

class Firebase {

	userLogin = (email, password, onError, onLogin) => {
		return new Promise(resolve => {
			auth().signInWithEmailAndPassword(email, password)
				.catch(error => {
					onError(error.code);
					resolve(null);
				}).then(user => {
					if (user) {
						// onLogin(user.user);
						resolve(user);
					}
				});
		})
	};

	createFirebaseAccount = (name, email, password, faith, onError, onRegister) => {
		var success = new Promise(resolve => {
			auth().createUserWithEmailAndPassword(email, password).catch(error => {
				onError(error.code);
				resolve(false);
			}).then(async (info) => {
				if (info) {
					let user = auth().currentUser;
					user.updateProfile({
						displayName: name
					});
					let {uid, email} = user;
					let now = new Date();
					let query = "uid=" + uid + "&email=" + encodeURIComponent(email) + "&name=" + encodeURIComponent(name) + "&faith=" + faith + "&createdAt=" + now.toISOString();
					let helper = new IgniteHelper();
					await helper.api('register', query);
		//			onRegister(user);
					resolve(true);
				}
			});
		});
		return success;
	};

	sendEmailWithPassword = (email, onError) => {
		return new Promise(resolve => {
			auth().sendPasswordResetEmail(email)
				.then(() => {
					resolve(true);
				}).catch(error => {
					onError(error.code);
					resolve(false);
				});
		})
	};

}

export default new Firebase();
