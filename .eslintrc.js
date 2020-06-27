module.exports = {
  root: true,
  "plugins": [
    "react",
    "react-native",
    "prettier"
  ],
  "parserOptions": {
      "ecmaFeatures": {
          "jsx": true
      }
  },
  'extends': [
    'airbnb',
    '@react-native-community',
    "plugin:prettier/recommended"
  ],
  'parser': 'babel-eslint',
  'env': {
    'jest': true,
    "react-native/react-native": true
  },
  'globals': {
    "fetch": false
  },
  'rules': {
    "prettier/prettier": 1,
    "react-native/no-unused-styles": 2,
    "react-native/no-raw-text": 2,
    "react-native/no-single-element-style-arrays": 2,
    /*"keyword-spacing": [2, { "overrides": {
      "if": { "after": false },
      "for": { "after": false },
      "while": { "after": false }
    }}],*/
    "keyword-spacing": 2,
    "no-use-before-define": 0,
    "react/jsx-filename-extension": 0,
    "react/prop-types": 0,
    "comma-dangle": 0,
    "react-native/no-inline-styles": 0,
    "no-did-mount-set": 0,
    "import/no-named-default": 0,
    "no-bitwise": 0,
    "react/no-did-mount-set-state": 0,
    "jsx-a11y/accessible-emoji": 0,
    "no-param-reassign": 0,
    "react/prefer-stateless-function": 0,
  }
};
