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
    "no-param-reassign": 0,
    'no-use-before-define': 'off',
    'react/jsx-filename-extension': 'off',
    'react/prop-types': 'off',
    'comma-dangle': 'off',
    "react-native/no-unused-styles": 2,
    "react-native/no-raw-text": 2,
    "react-native/no-single-element-style-arrays": 2,
    "keyword-spacing": ["error", { "overrides": {
      "if": { "after": false },
      "for": { "after": false },
      "while": { "after": false }
    }}],
  }
};
