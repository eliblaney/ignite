import React from "react";
import {AppState} from "react-native";
import auth from "@react-native-firebase/auth";
import Reactotron from "reactotron-react-native";
import IgniteHelper from "./IgniteHelper";

import JoinCommunityScreen from "./JoinCommunityScreen";
import FirebaseLogin from "../FirebaseLogin";
import LoadingScreen from "./LoadingScreen";
import MainScreen from "./MainScreen";
import WordScreen from "./WordScreen";

export default class AuthController extends React.Component {
  static navigationOptions = ({navigation}) => {
    return {headerShown: false};
  };

  constructor(props) {
    super(props);

    this.setToday();

    this.state = {
      loading: true,
      auth: false,
      user: null,
      word: null,
      currentDay: null,
      daysUntil: null,
      startedAt: false,
    };
  }

  componentDidMount() {
    AppState.addEventListener("change", state => {
      if (state === "active") {
        const date = new Date();
        if (date.getDate() !== this.today.getDate()) {
          this.setToday();
          this.reauth();
        }
      }
    });

    this.beginAuth();
  }

  setToday = () => {
    this.today = new Date();
    this.today.setHours(0);
    this.today.setMinutes(0);
    this.today.setSeconds(0);
    this.today.setMilliseconds(0);
  };

  beginAuth = () => {
    // entry -> is logged in?
    auth().onAuthStateChanged(async user => {
      if (user !== undefined && user !== null) {
        await this.setState({auth: true, user});
        this.checkCommunity(user.uid);
      } else {
        this.setState({loading: false, auth: false, user: null});
      }
    });
  };

  reauth = () => {
    // This is called when the retreat start date changes
    // and on logout for a fresh perspective
    this.resetState();
    this.componentDidMount();
  };

  resetState = () => {
    this.setState({
      loading: true,
      auth: false,
      user: null,
      word: null,
      currentDay: null,
      daysUntil: null,
      startedAt: false,
    });
  };

  onAuth = async user => {
    const {navigation} = this.props;
    navigation.pop();

    // User has succesfully logged in or registered
    this.setState({loading: true, auth: true, user});

    await this.checkCommunity(user.uid);
    this.forceUpdate();
  };

  signOutUser = async () => {
    try {
      await auth().signOut();
      // reset state to default (but finished loading)
      this.setState({
        loading: false,
        auth: false,
        user: null,
        startedAt: false,
      });
    } catch (e) {
      console.log(e);
      Reactotron.log(e);
    }
  };

  onCommunity = async communityid => {
    // User has joined or created a community
    const {navigation} = this.props;
    navigation.pop();

    await this.setState({loading: true, community: communityid}, () =>
      this.reauth()
    );
  };

  checkCommunity = async uid => {
    // entry -> is logged in? yes -> has a community?
    const user = await IgniteHelper.getUser(uid);
    if (user.community === undefined || user.community === null) {
      this.setState({loading: false});
    } else {
      // find age of user in days (age = 1 on first day of account creation)
      const createdDate = new Date(user.createdAt);
      const age = -IgniteHelper.daysUntil(IgniteHelper.toISO(createdDate));

      this.setState({community: user.community, age});
      await this.checkStartedAt(user);
    }
  };

  checkStartedAt = async (u = null) => {
    // entry -> is logged in? yes -> has a community? yes -> has started retreat?
    // user is the mysql user entry
    if (u === null) {
      const {user} = this.state;
      u = await IgniteHelper.getUser(user.uid);
    }

    if (
      u.startedAt === undefined ||
      u.startedAt === null ||
      u.startedAt === ""
    ) {
      this.setState({started: false});
    } else {
      const daysUntilStart = IgniteHelper.daysUntil(u.startedAt);
      const started = daysUntilStart <= 0;

      if (started) {
        // current day of the retreat (1, 2, 3, ...)
        const currentDay = -daysUntilStart + 1;

        this.setState({
          started: true,
          startedAt: u.startedAt,
          currentDay,
        });
      } else {
        // start date is in the future (probably next Ash Wednesday)
        this.setState({
          started: false,
          daysUntil: daysUntilStart,
        });
      }
    }

    await this.checkWord(u);
  };

  checkWord = async user => {
    const {word} = user;

    if (
      word === undefined ||
      word === null ||
      typeof word !== "string" ||
      word.indexOf("|") < 0
    ) {
      this.setState({
        word: null,
        wordExpired: true,
        loading: false,
      });
      return;
    }

    const bar = word.indexOf("|");
    const wordDate = word.substring(0, bar);

    // expired = if the word is at least yesterday's word
    const expired = IgniteHelper.daysUntil(wordDate) < 0;

    if (expired) {
      this.setState({
        word: null,
        wordExpired: true,
        loading: false,
      });
      return;
    }

    const wordText = word.substring(bar + 1);

    await this.setState({
      word: wordText,
      wordExpired: false,
      loading: false,
    });
  };

  onWord /* and upWord */ = async word => {
    const {navigation} = this.props;
    const {user} = this.state;
    navigation.pop();

    this.setState({
      loading: true,
      word,
      wordExpired: false,
    });

    const wordPlusDate = encodeURI(`${IgniteHelper.toISO(this.today)}|${word}`);
    await IgniteHelper.api(
      "user",
      `action=word&uid=${encodeURI(user.uid)}&word=${wordPlusDate}`
    );

    this.setState({loading: false});
  };

  render() {
    const {
      /* eslint-disable no-shadow */
      auth,
      user,
      /* eslint-enable no-shadow */
      loading,
      wordExpired,
      word,
      community,
      currentDay,
      daysUntil,
      started,
      startedAt,
      age,
    } = this.state;

    if (loading) {
      return <LoadingScreen />;
    }

    if (
      !auth /* you call it overdramatic, I call it safety */ ||
      user === undefined ||
      user === null ||
      user.uid === undefined ||
      user.uid === null
    ) {
      // FirebaseLogin's login callback is nice, but doesn't call on
      // register. I added an onAuth callback that gets called for
      // both logging in and registering.
      return <FirebaseLogin login={_user => {}} onAuth={this.onAuth} />;
    }

    // if the user doesn't have a community, that is the first thing
    // they should do
    if (community === undefined) {
      return (
        <JoinCommunityScreen
          uid={user.uid}
          onCommunity={this.onCommunity}
          reauth={this.reauth}
        />
      );
    }

    if (wordExpired) {
      return <WordScreen word={word} onNext={this.onWord} />;
    }

    return (
      <MainScreen
        reauth={this.reauth}
        user={user}
        community={community}
        currentDay={currentDay}
        daysUntil={daysUntil}
        started={started}
        startedAt={startedAt}
        age={age}
      />
    );
  }
}
