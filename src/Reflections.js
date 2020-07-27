import React from "react";
import {StyleSheet, ScrollView, View, Text} from "react-native";
import {default as VIcon} from "react-native-vector-icons/SimpleLineIcons";
import LinearGradient from "react-native-linear-gradient";
import Markdown from "react-native-markdown-display";
import TrackPlayer from "react-native-track-player";
import Colors from "./Colors";
import ashWednesdays from "../config/AshWednesdays";
import markdownstyles from "./markdown-styles";

import LoadingScreen from "./LoadingScreen";
import IgniteConfig from "../config/IgniteConfig";
import IgniteHelper from "./IgniteHelper";
import ReflectionNavigation from "./ReflectionNavigation";
import AudioPlayer from "./AudioPlayer";

export default class Reflections extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      text: "",
      isLent: false,
      splashText: "",
      suscipe: "",
      refreshing: true,
    };

    // I dream of the day when JS Date will finally know the months of the year
    this.months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    // it would be nice if it knew weekdays too
    this.weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  }

  // figures out whether the user has started yet and where in the retreat they are based on the day of the week
  // Sundays are break days so it must be aware of those in order to tell the user about it
  async componentDidMount() {
    const {uid, community, startedAt} = this.props;

    const user = await IgniteHelper.api("user", `action=getu&uid=${uid}`);

    const c = await IgniteHelper.api(
      "community",
      `action=geti&id=${community}`
    );
    let {members} = c;
    if (typeof members === "string") {
      c.members = JSON.parse(c.members);
      members = c.members;
    }
    const isOwner = members[0] === uid;

    // avoid unnecessary re-renders from react-native-swiper
    if (Reflections.initialized) return;
    Reflections.initalized = true;

    // only need to load data if we've actually started the retreat
    if (!startedAt) {
      this.setState({startedAt: false, loading: false, isOwner});
      return;
    }

    const {lang, faith, suscipe} = user;
    let suscipeText = null;
    if (suscipe != null) {
      suscipeText = IgniteHelper.decrypt(suscipe, true);
    } else {
      suscipeText = IgniteConfig.suscipe;
    }

    // determine whether this is a Lenten retreat to set
    // the maximum length of the reflections
    let isLent = false;
    for (let i = 0; i < ashWednesdays.length; i++) {
      const aw = ashWednesdays[i];
      if (startedAt === aw) {
        isLent = true;
        break;
      }
    }
    // TODO: Choose which reflections to remove from the non-Lent version
    // Until then, everyone has to use the Lent version
    isLent = true;

    this.setState({
      lang,
      faith,
      startedAt,
      isOwner,
      isLent,
      splashText: this.splashText(),
      suscipe: suscipeText,
    });

    let date = new Date();

    const day = this.getDay(date);

    if (!isLent && day > 40) {
      // if it's a normal 40-day retreat, the last date
      // that exists is day 40
      date = new Date(`${startedAt}T00:00:00`);
      date.setDate(date.getDate() + 40);
    } else if (day > 51) {
      // if it's a Lenten 51-day retreat, the last date
      // that exists is day 51
      date = new Date(`${startedAt}T00:00:00`);
      date.setDate(date.getDate() + 51);
    }
    if (day < 1) {
      // and if somehow this happens...
      date = new Date(`${startedAt}T00:00:00`);
    }

    this.updateContent(date);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // we don't need to re-render while we're loading data
    return !nextState.loading;
  }

  componentWillUnmount() {
    this.destroyPlayer();
  }

  getDay = date => {
    // day refers to the current day of the retreat (1, 2, 3, etc)
    const {startedAt} = this.state;

    date = IgniteHelper.toISO(date);

    return IgniteHelper.daysBetween(startedAt, date) + 1;
  };

  updateContent = date => {
    const {lang, faith} = this.state;
    const day = this.getDay(date);
    const isSunday = date.getDay() === 0;

    this.setState({date, isSunday});

    this.getContent(day, lang, faith);
  };

  createTrackPlayer = async () => {
    const {audio, day} = this.state;
    if (audio !== undefined && audio !== null && audio.length > 0) {
      TrackPlayer.setupPlayer().then(async () => {
        const track = {
          id: this.uuidv4(),
          url: audio,
          title: `Day ${day} Contemplation`,
          artist: "Ignite",
        };
        await TrackPlayer.reset();
        await TrackPlayer.add(track);
      });
    }
  };

  destroyPlayer = async () => {
    TrackPlayer.destroy();
  };

  getContent = async (day, lang, religion, flag = 0) => {
    const response = await IgniteHelper.api(
      "day",
      `day=${day}&lang=${lang}&religion=${religion}&flag=${flag}`
    );

    this.setState({
      loading: false,
      refreshing: false,
      text: response.content,
      audio: response.audio,
      day,
    });

    this.createTrackPlayer();
  };

  // to create unique ids for the tracks, required by TrackPlayer
  uuidv4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
      const r = (Math.random() * 16) | 0,
        v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  isPlaying = async () => {
    const state = await TrackPlayer.getState();
    return state === "playing";
  };

  playPause = async () => {
    const playing = await this.isPlaying();
    if (playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  splashText = () => {
    const splashes = [
      "Almost there!",
      "Soon and very soon!",
      "Getting closer!",
    ];
    return splashes[Math.floor(Math.random() * splashes.length)];
  };

  render() {
    const {
      loading,
      splashText,
      date,
      isOwner,
      isSunday,
      audio,
      isLent,
      day,
      suscipe,
      text,
      refreshing,
    } = this.state;
    const {startedAt, daysUntil} = this.props;

    if (loading) {
      return <LoadingScreen />;
    }

    if (!startedAt) {
      // user hasn't started the retreat yet
      return (
        <LinearGradient
          colors={[Colors.primary, Colors.secondary]}
          style={[styles.container, styles.gradientBackground]}
        >
          <Text
            style={{
              fontSize: 26,
              fontWeight: "bold",
              marginBottom: 50,
              color: Colors.primaryText,
            }}
          >
            {splashText}
          </Text>
          <Text style={{color: Colors.primaryText, fontSize: 16, margin: 20}}>
            {daysUntil > 0
              ? `The retreat starts in ${daysUntil} day${
                  daysUntil === 1 ? "" : "s"
                }. While you wait, read more about Ignite on the Kindling page!`
              : isOwner
              ? "Welcome to Ignite! You are your community's leader, so set a start date for the retreat and invite your friends to join you!"
              : "It looks like your group coordinator hasn't set a retreat start date yet. While you wait, read more about Ignite on the Kindling page!"}
          </Text>
          <View
            style={{
              marginTop: 20,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <VIcon
              name="arrow-left"
              size={20}
              style={{marginRight: 20}}
              color={Colors.primaryText}
            />
            <Text style={{color: Colors.primaryText}}>
              Try swiping left and right!
            </Text>
            <VIcon
              name="arrow-right"
              size={20}
              style={{marginLeft: 20}}
              color={Colors.primaryText}
            />
          </View>
        </LinearGradient>
      );
    }

    // maybe I'm asking too much of our poor Date object, but having a
    // Date.prototype.format() in the built-in library would be lovely
    const dateString = `${this.weekdays[date.getDay()]} ${
      this.months[date.getMonth()]
    } ${date.getDate()}`;

    if (refreshing) {
      return (
        <View style={styles.container}>
          <ReflectionNavigation
            title={dateString}
            isLent={isLent}
            date={date}
            day={day}
            onChange={this.updateContent}
          />
          <View style={styles.readerContainer}>
            <LoadingScreen />
          </View>
        </View>
      );
    }

    let sundayComponent;
    if (isSunday) {
      sundayComponent = (
        <View style={styles.sundayView}>
          <Text style={styles.sundayTitle}>🎉It&apos;s Sunday!🎉</Text>
          <Text style={styles.sundayText}>
            Just for today, you can break your fast. You should still keep
            adhering to the principles of silence.
          </Text>
        </View>
      );
    }

    let audioComponent;
    if (audio !== undefined && audio !== null && audio.length > 0) {
      audioComponent = (
        <AudioPlayer
          playPause={this.playPause}
          createTrackPlayer={this.createTrackPlayer}
        />
      );
    }

    return (
      <View style={styles.container}>
        <ReflectionNavigation
          title={dateString}
          isLent={isLent}
          date={date}
          day={day}
          onChange={this.updateContent}
        />
        <View style={styles.readerContainer}>
          <ScrollView showVerticalScrollIndicator={false}>
            {sundayComponent}
            <Text style={{marginBottom: 10}}>{suscipe}</Text>
            <Markdown style={markdownstyles}>{text}</Markdown>
            {audioComponent}
          </ScrollView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "stretch",
    backgroundColor: Colors.background,
  },
  readerContainer: {
    flex: 6,
    backgroundColor: Colors.background,
    margin: 20,
    fontSize: 26,
  },
  sundayView: {
    backgroundColor: Colors.secondary,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  sundayTitle: {
    // always dark text for aqua backgrounds
    color: "#222222",
    fontSize: 18,
    fontWeight: "bold",
  },
  sundayText: {
    // always dark text for aqua backgrounds
    color: "#222222",
  },
  gradientBackground: {
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },
});
