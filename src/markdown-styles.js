/* @flow */
import Colors from "./Colors";

const styles = {
  blockQuoteSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  blockQuoteSectionBar: {
    width: 3,
    height: null,
    //    backgroundColor: '#DDDDDD',
    backgroundColor: Colors.subview,
    marginRight: 15,
  },
  codeBlock: {
    fontFamily: "Courier",
    fontWeight: "500",
    marginBottom: 20,
  },
  del: {
    textDecorationLine: "line-through",
  },
  em: {
    fontStyle: "italic",
  },
  heading: {
    fontWeight: "200",
    marginBottom: 20,
  },
  heading1: {
    fontSize: 32,
  },
  heading2: {
    fontSize: 24,
  },
  heading3: {
    fontSize: 18,
  },
  heading4: {
    fontSize: 16,
  },
  heading5: {
    fontSize: 13,
  },
  heading6: {
    fontSize: 11,
  },
  hr: {
    // backgroundColor: '#cccccc',
    backgroundColor: Colors.fadedText,
    height: 1,
  },
  image: {
    width: 320,
    height: 320,
    margin: 20,
  },
  inlineCode: {
    // backgroundColor: '#eeeeee',
    // borderColor: '#dddddd',
    backgroundColor: Colors.subview,
    borderColor: Colors.fadedText,
    borderRadius: 3,
    borderWidth: 1,
    fontFamily: "Courier",
    fontWeight: "bold",
  },
  link: {
    textDecorationLine: "underline",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  listItemNumber: {
    fontWeight: "bold",
  },
  mailTo: {
    textDecorationLine: "underline",
  },
  paragraph: {
    flexWrap: "wrap",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  listItemText: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    // color: '#222222',
    color: Colors.modalText,
  },
  strong: {
    fontWeight: "bold",
  },
  table: {
    borderWidth: 1,
    // borderColor: '#222222',
    borderColor: Colors.modalText,
    borderRadius: 3,
    margin: 20,
  },
  tableHeader: {
    // backgroundColor: '#222222',
    backgroundColor: Colors.modalText,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tableHeaderCell: {
    // color: '#ffffff',
    color: Colors.background,
    fontWeight: "bold",
    padding: 5,
  },
  tableRow: {
    borderBottomWidth: 1,
    // borderColor: '#222222',
    borderColor: Colors.fadedText,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  tableRowLast: {
    borderColor: "transparent",
  },
  tableRowCell: {
    padding: 5,
  },
  text: {
    // color: '#222222',
    color: Colors.text,
  },
  u: {
    textDecorationLine: "underline",
  },
  video: {
    width: 300,
    height: 300,
    margin: 20,
  },
};

export default styles;
