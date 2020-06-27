import React from "react";
import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {Icon, Slider} from "react-native-elements";
import TrackPlayer from "react-native-track-player";
import Colors from "./Colors";

export default class AudioPlayer extends TrackPlayer.ProgressComponent {
  constructor(props) {
    super(props);
    this.state = {playing: false};
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
    return (
      <View>
        <Text style={styles.audioHeader}>Today&apos;s Contemplation</Text>
        <View style={styles.progressBarView}>
          <TouchableOpacity>
            <Icon
              raised
              name={this.state.playing ? "pause" : "play"}
              type="font-awesome"
              color={Colors.tertiary}
              onPress={this.props.playPause}
            />
          </TouchableOpacity>
          <View style={{flex: 1}}>
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
    margin: 20,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 20,
  },
  audioHeader: {
    fontSize: 23,
    textAlign: "center",
    marginTop: 20,
    color: Colors.fadedText,
    fontWeight: "bold",
  },
});
