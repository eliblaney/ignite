let dark = false;

function toggleDark() {
  dark = !dark;
}

function setDark(d) {
  dark = d;
}

export default {
  primary: "#0066cc",
  secondary: "#00cccc",
  tertiary: "#f2730c",
  primaryText: "#ffffff",
  get secondaryText() {
    return dark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)";
  },
  get modalBackground() {
    return dark ? "#222222" : "#ffffff";
  },
  get background() {
    return dark ? "#222222" : "#ffffff";
  },
  get text() {
    return dark ? "#eeeeee" : "#222222";
  },
  get modalText() {
    return dark ? "#eeeeee" : "#222222";
  },
  get fadedText() {
    return dark ? "#787878" : "#565656";
  },
  get subview() {
    return dark ? "#1a1a1a" : "#fafafa";
  },
  get isDark() {
    return dark;
  },
};

export {toggleDark, setDark};
