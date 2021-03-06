import React from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  ScrollView,
  View,
  Text,
} from "react-native";
import {Button, Overlay} from "react-native-elements";
import {default as VIcon} from "react-native-vector-icons/SimpleLineIcons";
import LinearGradient from "react-native-linear-gradient";
import Markdown from "react-native-markdown-display";
import AwesomeAlert from "react-native-awesome-alerts";
import {withNavigation} from "react-navigation";

import LoadingScreen from "./LoadingScreen";
import IgniteConfig from "../config/IgniteConfig";
import IgniteHelper from "./IgniteHelper";
import ReflectionNavigation from "./ReflectionNavigation";
import AudioPlayer from "./AudioPlayer";
import Colors from "./Colors";
import ashWednesdays from "../config/AshWednesdays";
import markdownstyles from "./markdown-styles";
import FastList from "./FastList";

export default withNavigation(
  class Reflections extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        text: "",
        isLent: false,
        splashText: "",
        suscipe: "",
        refreshing: true,
        reflectionIsToday: true,
        showPromptMessage: true,
        image: "default.jpg",
        showFastsModal: false,
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

      this.today = IgniteHelper.toISO(new Date());
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
      let isLent = true;
      for (let i = 0; i < ashWednesdays.length; i++) {
        const aw = ashWednesdays[i];
        if (startedAt === aw) {
          isLent = true;
          break;
        }
      }

      await this.setState({
        lang,
        faith,
        startedAt,
        isOwner,
        isLent,
        splashText: this.splashText(),
        suscipe: suscipeText,
        user,
      });

      this.setDate();
    }

    // TODO: Choose which reflections to remove from the non-Lent version
    // Until then, everyone has to use the Lent version
    // isLent = true;

    shouldComponentUpdate(nextProps, nextState) {
      // we don't need to re-render while we're loading data
      return !nextState.loading;
    }

    setDate = () => {
      const {isLent, startedAt} = this.state;

      let date = new Date();

      const day = this.getDay(date);

      if (!isLent && day > 40) {
        // if it's a normal 40-day retreat, the last date
        // that exists is day 40
        date = new Date(`${startedAt}T00:00:00`);
        date.setDate(date.getDate() + 39);
      } else if (day > 51) {
        // if it's a Lenten 51-day retreat, the last date
        // that exists is day 51
        date = new Date(`${startedAt}T00:00:00`);
        date.setDate(date.getDate() + 50);
      }
      if (day < 1) {
        // and if somehow this happens...
        date = new Date(`${startedAt}T00:00:00`);
      }

      this.updateContent(date);
    };

    getDay = date => {
      // day refers to the current day of the retreat (1, 2, 3, etc)
      const {startedAt} = this.state;

      date = IgniteHelper.toISO(date);

      return IgniteHelper.daysBetween(startedAt, date) + 1;
    };

    updateContent = async date => {
      const {lang, faith} = this.state;
      const day = this.getDay(date);
      const isSunday = date.getDay() === 0;
      const reflectionIsToday = IgniteHelper.toISO(date) === this.today;

      await this.setState({date, isSunday, reflectionIsToday});

      this.getContent(day, lang, faith);
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
        image: response.image,
      });
    };

    splashText = () => {
      const splashes = [
        "Almost there!",
        "Soon and very soon!",
        "Getting closer!",
      ];
      return splashes[Math.floor(Math.random() * splashes.length)];
    };

    parseSymbols = text => {
      const {navigation, uid, setSuscipe} = this.props;

      const options = {
        promptSuscipe: {
          enabled: false,
          message: {
            header: "Suscipe",
            text: "Today, try customizing your suscipe prayer!",
          },
          onConfirm: () => {
            navigation.push("suscipe", {
              uid,
              setSuscipe: suscipeText => {
                this.setState({
                  showPromptMessage: false,
                  suscipe: suscipeText,
                });
                setSuscipe(suscipeText);
              },
            });
          },
        },
        promptFasts: {
          enabled: false,
          button: {
            text: "Choose Fasts",
            description:
              "Now that you've examined your patterns of sin, accepted God's mercy, and chosen fasts to strengthen you, you will be better able to follow Christ through his minsitry and get to know him through Ignatian contemplation in the coming weeks.",
          },
          onConfirm: () => this.setState({showFastsModal: true}),
        },
      };
      let audioTranscript = null;

      // Enable/disable specified attributes
      Object.keys(options).forEach(k => {
        const pattern = new RegExp(`^\\#\\[${k}\\s*(.*)\\]$`, "m");
        if (pattern.test(text)) {
          const args = pattern.exec(text);
          options[k].enabled = args[1] !== "disabled";
        }
      });

      // Remove all attributes
      if (text === undefined) {
        text = "No reflection today. Enjoy a quick break!";
      }
      let reflectionText = text.replace(/^#\[.*\]$/gm, "");

      // Parse audio transcript
      const audioPattern = /\[audio\]([\s\S]*?)\[\/audio\]/m;
      if (audioPattern.test(reflectionText)) {
        const args = audioPattern.exec(reflectionText);
        // group 0: [audio]audioTranscript[/audio]
        // group 1: audioTranscript
        // Ignore group 0, we just need the inner text
        [, audioTranscript] = args;
        reflectionText = reflectionText.split(audioPattern);
        reflectionText.splice(1, 1);
      } else {
        // Transform into a single element array to avoid multiple types
        reflectionText = [reflectionText];
      }

      return {reflectionText, audioTranscript, options};
    };

    render() {
      const {
        loading,
        date,
        splashText,
        isOwner,
        isSunday,
        audio,
        isLent,
        day,
        suscipe,
        text,
        refreshing,
        showPromptMessage,
        reflectionIsToday,
        image,
        showFastsModal,
        user,
        showFastsConfirmed,
      } = this.state;
      const {reauth, startedAt, daysUntil, updateSuscipe} = this.props;

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

      if (!date) {
        // This will sometimes happen when logging in on day 1 for some reason
        reauth();
        return <LoadingScreen />;
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

      if (updateSuscipe && updateSuscipe !== suscipe) {
        this.setState({suscipe: updateSuscipe});
      }

      const {reflectionText, audioTranscript, options} = this.parseSymbols(
        text
      );
      let {promptSuscipe, promptFasts} = options;
      promptSuscipe =
        showPromptMessage &&
        promptSuscipe.enabled &&
        reflectionIsToday &&
        !updateSuscipe
          ? promptSuscipe
          : false;
      promptFasts = promptFasts.enabled ? (
        <View>
          <Button
            title={promptFasts.button.text}
            type="solid"
            style={{marginTop: -30, marginBottom: 20}}
            onPress={promptFasts.onConfirm}
          />
          <Text style={{paddingBottom: 60}}>
            {promptFasts.button.description}
          </Text>
        </View>
      ) : (
        false
      );
      const promptMessage =
        promptFasts.message !== undefined
          ? promptFasts.message
          : promptSuscipe.message;

      let sundayComponent;
      // Breaking fast occurs on Sundays after the first movement
      // During the first movement, there are no fasts to break
      if (isSunday && IgniteHelper.getMovement(day) > 1) {
        sundayComponent = (
          <View style={styles.sundayView}>
            <Text style={styles.sundayTitle}>🎉It&apos;s Sunday!🎉</Text>
            <Text style={styles.sundayText}>
              Just for today, you can break your fast. You should still keep
              adhering to the group practices.
            </Text>
          </View>
        );
      }

      let audioComponent;
      if (audio !== undefined && audio !== null && audio.length > 0) {
        audioComponent = (
          <AudioPlayer
            audio={audio}
            title={`Day ${day} Contemplation`}
            audioTranscript={audioTranscript}
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
          <ScrollView showVerticalScrollIndicator={false}>
            <Image
              style={{width: Dimensions.get("window").width, height: 200}}
              source={{uri: IgniteHelper.image(image)}}
            />
            <View style={styles.readerContainer}>
              {sundayComponent}
              <Text style={{margin: 10, fontSize: 16}}>{suscipe}</Text>
              {reflectionText.map((textSegment, index) => (
                // Render audio component in place of [audio][/audio] tags
                // reflectionText is an array split at that index
                <View key={index.toString()}>
                  {index === 1 && audioComponent}
                  <Markdown style={markdownstyles}>{textSegment}</Markdown>
                </View>
              ))}
              {promptFasts}
            </View>
          </ScrollView>
          <AwesomeAlert
            show={reflectionText !== null && promptMessage}
            showProgress={false}
            title={promptMessage ? promptMessage.header : ""}
            message={promptMessage ? promptMessage.text : ""}
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={true}
            showConfirmButton={true}
            cancelText="Maybe Later"
            cancelButtonColor="#676767"
            onCancelPressed={() => this.setState({showPromptMessage: false})}
            confirmText="Sure!"
            confirmButtonColor="#229944"
            onConfirmPressed={() => {
              this.setState({showPromptMessage: false});
              promptSuscipe.onConfirm();
            }}
          />
          <Overlay
            isVisible={showFastsModal}
            overlayStyle={{backgroundColor: Colors.modalBackground}}
            onBackdropPress={() => this.setState({showFastsModal: null})}
          >
            <FastList
              user={user}
              onSave={() =>
                this.setState({showFastsModal: null, showFastsConfirmed: true})
              }
            />
          </Overlay>
          <AwesomeAlert
            show={showFastsConfirmed}
            showProgress={false}
            title="Yay!"
            message="You can always find these fasts with the Kindling."
            closeOnTouchOutside={false}
            closeOnHardwareBackPress={false}
            showCancelButton={false}
            showConfirmButton={true}
            onDismiss={() => this.setState({showFastsConfirmed: false})}
            confirmText="Cool!"
            confirmButtonColor="#229944"
            onConfirmPressed={() => {
              this.setState({showFastsConfirmed: false});
            }}
          />
        </View>
      );
    }
  }
);

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
