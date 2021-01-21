import React from "react";
import {ScrollView, View, StyleSheet} from "react-native";
import {withNavigation} from "react-navigation";
import SettingsList from "react-native-settings-list";
import Colors from "./Colors";
import Header from "./Header";

export default withNavigation(
  class Kindling extends React.Component {
    createDetail = (title, file) => {
      const {navigation} = this.props;

      const item = (
        <SettingsList.Item
          displayName="Item"
          itemWidth={50}
          title={title}
          titleStyle={{color: Colors.text}}
          onPress={() =>
            navigation.push("kindling", {
              title,
              file,
            })
          }
        />
      );
      item.displayName = "Item";
      return item;
    };

    createCustom = (title, navLocation) => {
      const {navigation, uid, reauth, setSuscipe} = this.props;

      const item = (
        <SettingsList.Item
          displayName="Item"
          itemWidth={50}
          title={title}
          titleStyle={{color: Colors.text}}
          onPress={() =>
            navigation.push(navLocation, {
              uid,
              reauth,
              setSuscipe,
            })
          }
        />
      );
      item.displayName = "Item";
      return item;
    };

    createHeader = title => {
      const item = (
        <SettingsList.Item
          hasNavArrow={false}
          title={title}
          titleStyle={{
            color: Colors.fadedText,
            marginTop: 10,
            fontWeight: "bold",
          }}
          itemWidth={70}
          borderHide="Both"
        />
      );
      return item;
    };

    render() {
      return (
        <ScrollView>
          <Header title="Kindling" />
          <View style={styles.container}>
            <SettingsList
              borderColor={Colors.text}
              backgroundColor={Colors.background}
            >
              {this.createHeader("The Foundations")}
              {this.createDetail("What is Ignite?", "whatisignite")}
              {this.createDetail("Guide to Community", "guidetocommunity")}
              {this.createDetail("Guide to Fasting", "guidetofasting")}
              {this.createDetail("Guide to Prayer", "guidetoprayer")}
              {this.createDetail("Meeting Guide", "meetingguide")}
              {this.createHeader("Helpful Resources")}
              {this.createDetail("Why should I do Ignite?", "whyignite")}
              {this.createDetail(
                "How to prepare for Ignite",
                "prepareforignite"
              )}
              {this.createHeader("Settings")}
              {this.createCustom("Edit Suscipe", "suscipe")}
              {this.createCustom("Account", "account")}
              {/* this.createDetail('Dark Mode', 'whatisignite') */}
              {this.createHeader("About")}
              {this.createDetail("Attributions", "attributions")}
            </SettingsList>
          </View>
        </ScrollView>
      );
    }
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 10,
    paddingRight: 20,
    paddingBottom: 40,
  },
});
