import React from "react";
import {StyleSheet, TouchableOpacity, View} from "react-native";
import {Icon, Slider} from "react-native-elements";
import TrackPlayer from "react-native-track-player";
import Markdown from "react-native-markdown-display";

import markdownstyles from "./markdown-styles";
import Colors from "./Colors";

export default class AudioPlayer extends TrackPlayer.ProgressComponent {
  constructor(props) {
    super(props);
    this.state = {playing: false, showTranscript: false};
  }

  componentDidMount() {
    super.componentDidMount();
    this.onQueueEnded = TrackPlayer.addEventListener(
      "playback-queue-ended",
      async data => {
        // This stops the player from repeating the queue...
        TrackPlayer.destroy();
        this.props.createTrackPlayer();
      }
    );
    this.onPlaybackStateChange = TrackPlayer.addEventListener(
      "playback-state",
      async data => {
        this.setState({playing: data.state === "playing"});
      }
    );
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    this.onQueueEnded.remove();
    this.onPlaybackStateChange.remove();
  }

  render() {
    const {showTranscript} = this.state;
    const {audioTranscript} = this.props;

    return (
      <View>
        {/*
        <Text style={styles.audioHeader}>Today&apos;s Contemplation</Text>
        */}
        <View style={styles.progressBarView}>
          <View style={styles.audioControls}>
            <TouchableOpacity>
              <Icon
                raised
                name={this.state.playing ? "pause" : "play"}
                type="font-awesome"
                color={Colors.tertiary}
                onPress={this.props.playPause}
              />
            </TouchableOpacity>
            <View style={{flex: 9}}>
              <Slider
                disabled
                style={{width: "100%"}}
                value={this.getProgress()}
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
  /*
  audioHeader: {
    fontSize: 23,
    textAlign: "center",
    marginTop: 20,
    color: Colors.fadedText,
    fontWeight: "bold",
  },
  */
  transcriptContainer: {
    marginLeft: 20,
    marginRight: 20,
  },
});
