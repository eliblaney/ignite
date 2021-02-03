import React from "react";
import {ScrollView} from "react-native";
import {Button, CheckBox, Input, Text} from "react-native-elements";
import IgniteHelper from "./IgniteHelper";
import LoadingScreen from "./LoadingScreen";

export default class FastList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fasts: null,
    };
  }

  async componentDidMount() {
    const {user} = this.props;
    let {fasts} = user;
    if (typeof fasts === "string") {
      fasts = JSON.parse(fasts);
    }
    if (!fasts) {
      fasts = {
        defaults: {
          "Taking short, cold, or lukewarm showers": 0,
          "Practicing regular, rigorous exercise": 0,
          "Fasting from desserts and sweets": 0,
          "Fasting from headphones": 0,
          "Fasting from meat": 0,
          "Fasting from gossip": 0,
          "Fasting from driving": 0,
          "Fasting from climate comfort": 0,
        },
        custom: "",
      };
    }
    this.setState({fasts});
  }

  save = async () => {
    const {fasts} = this.state;
    const {user, onSave} = this.props;

    await IgniteHelper.api(
      "user",
      `action=fast&uid=${encodeURI(user.uid)}&fasts=${encodeURI(
        JSON.stringify(fasts)
      )}`
    );

    onSave();
  };

  render() {
    const {fasts} = this.state;

    if (!fasts) {
      return <LoadingScreen />;
    }

    return (
      <ScrollView style={{flex: 1}}>
        <Text style={{margin: 10}}>
          Is God calling me to deeper, more intentional faith by...
        </Text>
        {Object.entries(fasts.defaults).map(([f, c]) => {
          return (
            <CheckBox
              title={f}
              checked={c}
              onPress={() => {
                this.setState(prevState => {
                  const newf = prevState.fasts;
                  newf.defaults[f] = !newf.defaults[f];
                  return {fasts: newf};
                });
              }}
            />
          );
        })}
        <Input
          inputStyle={{
            margin: 10,
          }}
          multiline={true}
          numberofLines={5}
          onChangeText={text =>
            this.setState(prevState => {
              const newf = prevState.fasts;
              newf.custom = text;
              return {fasts: newf};
            })
          }
          placeholder="You can write your own here!"
          value={fasts.custom}
        />
        <Button
          type="solid"
          onPress={this.save}
          title="SAVE"
          buttonStyle={{
            margin: 20,
            marginBottom: 30,
            backgroundColor: "#228822",
          }}
        />
      </ScrollView>
    );
  }
}
