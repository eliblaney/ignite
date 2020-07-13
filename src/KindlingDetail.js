import React from "react";
import {ScrollView, StyleSheet} from "react-native";
import Markdown from "react-native-markdown-display";
import {withNavigation} from "react-navigation";
import markdownstyles from "../markdown-styles";
import Colors from "./Colors";

export default withNavigation(
  class KindlingDetail extends React.Component {
    static navigationOptions = ({navigation}) => {
      return {
        headerMode: "float",
        headerBackTitleVisible: true,
        title: navigation.getParam("title", "Ignite"),
      };
    };

    constructor(props) {
      super(props);
      const {navigation} = this.props;

      this.state = {...navigation.state.params, filetext: ""};
    }

    async componentDidMount() {
      const {file} = this.state;

      fetch(`https://eliblaney.com/ignite/api/v1/kindling/${file}.md`)
        .then(response => response.text())
        .then(text => this.setState({filetext: text}));

      /*
      // Deprecated local file usage
      let file = "./kindling/" + file + ".md"
      let rawFile = new XMLHttpRequest()
      rawFile.open("GET", file, false)
      rawFile.onreadystatechange = () => {
        if (rawFile.readyState === 4) {
          if (rawFile.status === 200 || rawFile.status == 0) {
            let filetext = rawFile.responseText
            this.setState({filetext})
          }
        }
      }
      rawFile.send(null)
      */
    }

    render() {
      const {filetext} = this.state;

      return (
        <ScrollView
          style={styles.container}
          showVerticalScrollIndicator={false}
        >
          <Markdown style={markdownstyles}>{filetext}</Markdown>
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
