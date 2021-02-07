import React from "react";
import Swiper from "react-native-swiper"; /* Edits: Comment {dots}, make conditional at componentWillMount get both lines */
import Colors from "./Colors";

import Reflections from "./Reflections";
import Community from "./Community";
import Kindling from "./Kindling";

export default class MainScreen extends React.PureComponent {
  static navigationOptions = ({navigation}) => {
    return {headerShown: false};
  };

  constructor(props) {
    super(props);
    this.state = {
      updateSuscipe: false,
    };
  }

  setSuscipe = x => this.setState({updateSuscipe: x});

  render() {
    const {
      reauth,
      community,
      currentDay,
      daysUntil,
      started,
      startedAt,
      user,
      age,
    } = this.props;
    const {updateSuscipe} = this.state;

    const communityComponent = (
      <Community
        reauth={reauth}
        uid={user.uid}
        community={community}
        currentDay={currentDay}
        daysUntil={daysUntil}
        startedAt={started ? startedAt : false}
      />
    );
    const kindlingComponent = (
      <Kindling reauth={reauth} uid={user.uid} setSuscipe={this.setSuscipe} />
    );
    const reflectionsComponent = (
      <Reflections
        reauth={reauth}
        uid={user.uid}
        community={community}
        startedAt={started ? startedAt : false}
        daysUntil={daysUntil}
        updateSuscipe={updateSuscipe}
        setSuscipe={this.setSuscipe}
      />
    );

    // if it's their first time opening the app, show the
    // tutorial message on the reflections screen
    return (
      <Swiper
        index={age < 2 ? 0 : 1}
        style={{backgroundColor: Colors.background}}
      >
        {reflectionsComponent}
        {communityComponent}
        {kindlingComponent}
      </Swiper>
    );
  }
}
