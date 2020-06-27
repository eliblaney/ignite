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

  render() {
    const {
      reauth,
      community,
      currentDay,
      daysUntil,
      started,
      startedAt,
      logout,
      user,
      age,
    } = this.props;

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
    const kindlingComponent = <Kindling logout={logout} uid={user.uid} />;
    const reflectionsComponent = (
      <Reflections
        uid={user.uid}
        community={community}
        startedAt={started ? startedAt : false}
        daysUntil={daysUntil}
      />
    );

    if (age < 2) {
      // if it's their first time opening the app, show the
      // tutorial message on the reflections screen
      return (
        <Swiper style={{backgroundColor: Colors.background}}>
          {reflectionsComponent}
          {communityComponent}
          {kindlingComponent}
        </Swiper>
      );
    } else {
      return (
        <Swiper>
          {communityComponent}
          {kindlingComponent}
          {reflectionsComponent}
        </Swiper>
      );
    }
  }
}
