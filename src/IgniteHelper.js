import Reactotron from "reactotron-react-native";
import base64 from "react-native-base64";
import CryptoJS from "crypto-js";
import DeviceInfo from "react-native-device-info";
import IgniteConfig from "../config/IgniteConfig";

export default class IgniteHelper {
  // call the API
  static async api(apiKey, query) {
    const headers = new Headers({
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Ignite/1.0",
    });
    const body = `cltToken=${IgniteConfig.apiKey}&${query}`;
    const result = await fetch(`${IgniteConfig.apiUrl + apiKey}.php`, {
      method: "POST",
      headers,
      body,
    }).catch(error => Reactotron.error(error));
    try {
      const data = await result.json();
      return data;
    } catch {
      // Default error case
      return {success: "0", error: "998"};
    }
  }

  static async getUser(uid) {
    const user = await IgniteHelper.api("user", `action=getu&uid=${uid}`);
    return user;
  }

  static image = name => {
    const uri = `https://eliblaney.com/ignite/images/${encodeURI(name)}`;
    return uri;
  };

  // encrypt data
  // personal = encrypt with device ID, making it unreadable to anyone except
  // the owner of the device
  static encrypt(data, personal) {
    const keySize = 512;
    const iterations = 1000;
    const ivSize = 128;

    let suffix = "";
    if (personal !== undefined && personal) {
      suffix = DeviceInfo.getUniqueId();
    }
    const pass = CryptoJS.SHA256(
      `“Go forth and set the world on fire.” ― St. Ignatius of Loyola${suffix}`
    );

    const salt = CryptoJS.lib.WordArray.random(ivSize / 8);
    const iv = CryptoJS.lib.WordArray.random(ivSize / 8);

    const key = CryptoJS.PBKDF2(pass, salt, {
      keySize: keySize / 32,
      iterations,
    });

    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    // [salt, 32][iv, 32][encypted, x]
    return base64.encode(
      salt.toString() + iv.toString() + encrypted.toString()
    );
  }

  // decrypt data
  static decrypt(data, personal) {
    const decoded = base64.decode(data);
    const keySize = 512;
    const iterations = 1000;

    let suffix = "";
    if (personal !== undefined && personal) {
      suffix = DeviceInfo.getUniqueId();
    }
    const pass = CryptoJS.SHA256(
      `“Go forth and set the world on fire.” ― St. Ignatius of Loyola${suffix}`
    );

    const salt = CryptoJS.enc.Hex.parse(decoded.substr(0, 32));
    const iv = CryptoJS.enc.Hex.parse(decoded.substr(32, 32));
    const encrypted = decoded.substring(64);

    const key = CryptoJS.PBKDF2(pass, salt, {
      keySize: keySize / 32,
      iterations,
    });

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // get a readable "x days ago" format from date object
  static timeSince(date) {
    // https://stackoverflow.com/questions/3177836/how-to-format-time-since-xxx-e-g-4-minutes-ago-similar-to-stack-exchange-site
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} year${interval > 1 ? "s" : ""} ago`;
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} month${interval > 1 ? "s" : ""} ago`;
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} day${interval > 1 ? "s" : ""} ago`;
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} hour${interval > 1 ? "s" : ""} ago`;
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} minute${interval > 1 ? "s" : ""} ago`;
    }
    return `${Math.floor(seconds)} second${
      Math.floor(seconds) > 1 ? "s" : ""
    } ago`;
  }

  // get initials from Firstname Lastname
  static initials = name => {
    if (name.length < 2) {
      return name[0].toUppercase();
    }
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  // get movement from retreat day number
  static getMovement = day => {
    if (typeof day === "string") {
      day = parseInt(day, 10);
    }
    if (day <= 0) {
      return 0;
    } else if (day <= 11) {
      return 1;
    } else if (day <= 11 + 26) {
      return 2;
    } else if (day <= 11 + 26 + 9) {
      return 3;
    } else if (day <= 11 + 26 + 9 + 5) {
      return 4;
    } else {
      return null;
    }
  };

  static movementText = movement => {
    switch (movement) {
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
  };

  static padnum = (num, len, ch) => {
    if (num >= 10 ** (len - 1)) return num;
    return `${ch}`.repeat(len - 1) + num;
  };

  static toISO = date => {
    const iso = `${date.getFullYear()}-${IgniteHelper.padnum(
      date.getMonth() + 1,
      2,
      "0"
    )}-${IgniteHelper.padnum(date.getDate(), 2, "0")}`;
    return iso;
  };

  static daysUntil = date => {
    // get today displayed as an ISO date
    const todayDate = new Date();
    const today = IgniteHelper.toISO(todayDate);

    return IgniteHelper.daysBetween(today, date);
  };

  static daysBetween = (from, to) => {
    // consistent times & timezones
    const fromDate = new Date(`${from}T00:00:00Z`);
    const toDate = new Date(`${to}T00:00:00Z`);

    const daysUntil = (toDate - fromDate) / 1000 / 60 / 60 / 24;
    return daysUntil;
  };
}
