import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {Icon, Slider} from "react-native-elements";
import {Player} from "@react-native-community/audio-toolkit";
import Markdown from "react-native-markdown-display";
import AwesomeAlert from "react-native-awesome-alerts";

import markdownstyles from "./markdown-styles";
import Colors from "./Colors";

export default class AudioPlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {showTranscript: false, playing: false, progress: 0};
  }

  async componentDidMount() {
    const {audio} = this.props;
    this.player = new Player(audio, {
      autoDestroy: false,
      continuesToPlayInBackground: true,
    }).prepare(err => {
      if (!err) {
        this.player.looping = false;
        this.player.wakeLock = true;

        this.timer = setInterval(() => {
          this.setState({
            progress:
              Math.max(0, this.player.currentTime) / this.player.duration,
          });
        }, 200);
      } else {
        this.setState({error: err.err});
      }
    });
  }

  async componentWillUnmount() {
    if (this.player) {
      this.player.destroy();
    }
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  playPause = async () => {
    const {playing} = this.state;
    if (playing) {
      this.player.pause();
    } else {
      this.player.play();
    }
    this.setState({playing: !playing});
  };

  render() {
    if (!error && !this.player) {
      return <ActivityIndicator />;
    }

    const {showTranscript, playing, progress, error} = this.state;
    const {audioTranscript} = this.props;

    return (
      <View>
        <View style={styles.progressBarView}>
          <View style={styles.audioControls}>
            <TouchableOpacity>
              <Icon
                raised
                name={playing ? "pause" : "play"}
                type="font-awesome"
                color={Colors.tertiary}
                onPress={this.playPause}
              />
            </TouchableOpacity>
            <View style={{flex: 9}}>
              <Slider
                disabled
                style={{width: "100%"}}
                value={progress}
                thumbTintColor={Colors.tertiary}
                thumbStyle={{width: 12, height: 12}}
                minimumTrackTintColor={Colors.tertiary}
                maximumTrackTintColor="#777777"
              />
            </View>
            {audioTranscript && (
              <View style={{flex: 1}}>
                <TouchableOpacity>
                  <Icon
                    name={showTranscript ? "angle-up" : "angle-down"}
                    type="font-awesome"
                    color={Colors.tertiary}
                    onPress={() =>
                      this.setState({showTranscript: !showTranscript})
                    }
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
          {showTranscript && (
            <View style={styles.transcriptContainer}>
              <Markdown style={markdownstyles}>{audioTranscript}</Markdown>
            </View>
          )}
        </View>
        <AwesomeAlert
          show={error && error !== true}
          showProgress={false}
          title="Error"
          message={`Sorry, could not load audio. Please restart the app and try again. (Error: ${error})`}
          closeOnTouchOutside={false}
          closeOnHardwareBackPress={false}
          showCancelButton={false}
          showConfirmButton={true}
          confirmButtonText="Close"
          confirmButtonColor="#676767"
          onConfirmPressed={() => this.setState({error: true})}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  progressBarView: {
    borderRadius: 50,
    backgroundColor: Colors.subview,
    padding: 10,
    marginTop: 0,
    margin: 20,
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-start",
    paddingRight: 20,
  },
  audioControls: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  transcriptContainer: {
    marginLeft: 20,
    marginRight: 50,
    paddingRight: 50,
  },
});
