import React from "react";
import {withNavigation} from "react-navigation";
import {Platform, Text, ScrollView} from "react-native";
import Markdown from "react-native-markdown-display";
import AudioPlayer from "../AudioPlayer";
import markdownstyles from "../markdown-styles";

export default withNavigation(
  class Examen extends React.Component {
    static navigationOptions = ({navigation}) => {
      return {
        headerMode: "float",
        headerBackTitleVisible: Platform.OS === "ios",
        title: "The Examen",
      };
    };

    constructor(props) {
      super(props);

      this.audioUrl = "https://eliblaney.com/ignite/examen.mp3";
      this.examenScript =
        "1. **Begin by putting yourself in the presence of God. Create a quiet, prayerful space within your mind and heart. Draw near to the flame of God’s love.**\n\n* Breathe in the grace of God that surrounds you. Become aware of God’s presence with you right now.\n\n* Thank God for accompanying you on your spiritual journey, for allowing you to know God more deeply.\n\n* Thank God for being present to you, even when you do not recognize God’s presence.\n\n2. **Ask God to help you as you review the events of your day with gratitude in your mind’s eye through the gift of your memory.**\n\n* You deeply desire the ability to review the events of your day with clarity.\n\n* Invite God to sit down with you and review these events together.\n\n* Begin with the start of the day. (What were you feeling as you woke up? What did you eat for breakfast, if you ate at all? How were you feeling in each class?)\n\n* See the times in your day when you turned to or felt close to God. Perhaps you felt a spark of God’s presence. Through all of this, be aware of your emotions with each event.\n\n* See the times in your day when you turned away from God or from your true self. Where did you turn away or close yourself off from the fire of God? Again, be aware of your emotions with each event.\n\n* What have you noticed about your practice of fasting? Have you experienced any freedom or grace through the fast recently?\n\n3. **Choose one feature of the day and pray from it.**\n\n* After you review your day, select one experience, event or feeling and contemplate it for a few minutes with God. Talk with God about it.\n\n* Do you sense how God feels about that event?\n\n* What grace, even if it is hard to see initially, did you experience?\n\n4. **Look toward tomorrow.**\n\n* Be mindful that regardless of this day, you have another day for which to look forward.\n\n* Ask God for what you desire out of the next 24 hours of life.\n\n* You might consider setting an intention for how you want to live more closely with God tomorrow.\n\n5.  **End your Examen today by thanking God for daily helping you to grow in goodness and love.**\n\nThank You, God, for allowing me to become aware of what gives me life and what does not; for allowing me to find You in all things; for allowing me to love You and trust You more deeply. Amen.\n";
    }

    onSave = () => {
      const {navigation} = this.props;

      navigation.goBack();
    };

    render() {
      return (
        <ScrollView style={{flex: 1}}>
          <Text style={{margin: 10, fontSize: 16}}>
            The Examen is a powerful tool that will help you assess your current
            spiritual wellbeing and prepare you to build yourself up tomorrow.
          </Text>
          <AudioPlayer
            audio={this.audioUrl}
            title="Examen"
            audioTranscript={null}
          />
          <Markdown style={markdownstyles}>{this.examenScript}</Markdown>
        </ScrollView>
      );
    }
  }
);
