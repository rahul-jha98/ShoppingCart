module.exports = {
  'env': {
    'browser': true,
    'commonjs': true,
    'es6': true,
  },
  'extends': [
    'google',
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly',
  },
  'parserOptions': {
    'ecmaVersion': 2018,
  },
  'rules': {
    'indent': ["error", 4, { "VariableDeclarator": "first" }],
    'no-multi-spaces': ["error", { exceptions: { "VariableDeclarator": true } }],
    'one-var': ["error", "consecutive"],
    'new-cap': ["error", { "capIsNew": false , 'newIsCap': false}]
  },
};
