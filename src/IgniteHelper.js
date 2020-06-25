import Reactotron from 'reactotron-react-native';
import base64 from 'react-native-base64';
import CryptoJS from 'crypto-js';
import DeviceInfo from 'react-native-device-info';
import IgniteConfig from '../config/IgniteConfig';

export default class IgniteHelper {

	// call the API
	async api(apiKey, query) {
		let headers = new Headers({
				"Accept": "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
				"User-Agent": "Ignite/1.0"
			});
		let body = "cltToken=" + IgniteConfig.apiKey + "&" + query;
		let result = await fetch(IgniteConfig.apiUrl + apiKey + '.php', {
			method: 'POST',
			headers: headers,
			body: body,
		})
		.catch((error) => Reactotron.error(error));
		let data = await result.json();
		return data;
	}

	async getUser(uid) {
		let user = await this.api('user', 'action=getu&uid=' + uid);
		return user;
	}

	// encrypt data
	// personal = encrypt with device ID, making it unreadable to anyone except
	// the owner of the device
	encrypt(data, personal) {
		let keySize = 512;
		let iterations = 1000;
		let ivSize = 128;

		let suffix = "";
		if(personal !== undefined && personal) {
			suffix = DeviceInfo.getUniqueId();
		}
		let pass = CryptoJS.SHA256("“Go forth and set the world on fire.” ― St. Ignatius of Loyola" + suffix);

		let salt = CryptoJS.lib.WordArray.random(128/8);
		let iv = CryptoJS.lib.WordArray.random(128/8);

		let key = CryptoJS.PBKDF2(pass, salt, {
			keySize: keySize / 32,
			iterations: 1000
		});

		let encrypted = CryptoJS.AES.encrypt(data, key, {
			iv: iv,
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC
		});

		// [salt, 32][iv, 32][encypted, x]
		return base64.encode(salt.toString() + iv.toString() + encrypted.toString());
	}

	// decrypt data
	decrypt(data, personal) {
		let decoded = base64.decode(data);
		let keySize = 512;
		let iterations = 1000;
		let ivSize = 128;

		let suffix = "";
		if(personal !== undefined && personal) {
			suffix = DeviceInfo.getUniqueId();
		}
		let pass = CryptoJS.SHA256("“Go forth and set the world on fire.” ― St. Ignatius of Loyola" + suffix);

		let salt = CryptoJS.enc.Hex.parse(decoded.substr(0, 32));
		let iv = CryptoJS.enc.Hex.parse(decoded.substr(32, 32));
		let encrypted = decoded.substring(64);

		let key = CryptoJS.PBKDF2(pass, salt, {
			keySize: keySize / 32,
			iterations: iterations
		});

		let decrypted = CryptoJS.AES.decrypt(encrypted, key, {
			iv: iv,
			padding: CryptoJS.pad.Pkcs7,
			mode: CryptoJS.mode.CBC
		});

		return decrypted.toString(CryptoJS.enc.Utf8);
	}

	// get a readable "x days ago" format from date object
	timeSince(date) {
		// https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
		let seconds = Math.floor((new Date() - date) / 1000);
		let interval = Math.floor(seconds / 31536000);
		if (interval >= 1) {
			return interval + " year" + (interval > 1 ? "s":"") + " ago";
		}
		interval = Math.floor(seconds / 2592000);
		if (interval >= 1) {
			return interval + " month" + (interval > 1 ? "s":"") + " ago";
		}
		interval = Math.floor(seconds / 86400);
		if (interval >= 1) {
			return interval + " day" + (interval > 1 ? "s":"") + " ago";
		}
		interval = Math.floor(seconds / 3600);
		if (interval >= 1) {
			return interval + " hour" + (interval > 1 ? "s":"") + " ago";
		}
		interval = Math.floor(seconds / 60);
		if (interval >= 1) {
			return interval + " minute" + (interval > 1 ? "s":"") + " ago";
		}
		return Math.floor(seconds) + " second" + (Math.floor(seconds) > 1 ? "s":"") + " ago";
	}

	// get initials from Firstname Lastname
	initials = (name) => {
		if(name.length < 2) {
			return name[0].toUppercase();
		}
		return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
	}

	// get movement from retreat day number
	getMovement = (day) => {
		switch(true) {
			case (day <= 0):
			default:
				return 0;
			case (day <= 11):
				return 1;
			case (day <= 11+26):
				return 2;
			case (day <= 11+26+9):
				return 3;
			case (day <= 11+26+9+5):
				return 4;
		}
	}

	movementText = (movement) => {
		switch(movement) {
			default:
				return null;
			case 1:
				return "1st Movement";
			case 2:
				return "2nd Movement";
			case 3:
				return "3rd Movement";
			case 4:
				return "4th Movement";
		}
	}

	padnum = (num, len, ch) => {
		if(num >= Math.pow(10, len - 1)) return num;
		return ("" + ch).repeat(len - 1) + num;
	}

	toISO = (date) => {
		let iso = date.getFullYear() + '-' + this.padnum(date.getMonth() + 1, 2, '0') + '-' + this.padnum(date.getDate(), 2, '0');
		return iso;
	}

	daysUntil = (date) => {
		// get today displayed as an ISO date
		let todayDate = new Date();
		let today = this.toISO(todayDate);

		// consistent times & timezones
		todayDate = new Date(today + "T00:00:00Z");
		let compareDate = new Date(date + "T00:00:00Z")

		let daysUntil = (compareDate - todayDate)/1000/60/60/24;
		return daysUntil;
	}

};
