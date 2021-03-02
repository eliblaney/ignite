/* @flow */
import Colors from "./Colors";

const styles = {
  body: {
    marginBottom: 40,
    marginRight: 10,
    marginLeft: 10,
    color: Colors.text,
    fontSize: 16,
  },
  blockquote: {
    backgroundColor: Colors.modalBackground,
  },
  hr: {
    backgroundColor: Colors.fadedText,
  },
  code_inline: {
    backgroundColor: Colors.subview,
    borderColor: Colors.fadedText,
  },
  code_block: {
    backgroundColor: Colors.subview,
    borderColor: Colors.fadedText,
  },
  fence: {
    backgroundColor: Colors.subview,
    borderColor: Colors.fadedText,
  },
  table: {
    borderColor: Colors.fadedText,
  },
  thead: {
    backgroundColor: Colors.modalBackground,
  },
  tr: {
    borderColor: Colors.fadedText,
  },
  blocklink: {
    borderColor: Colors.fadedText,
  },
};

export default styles;
