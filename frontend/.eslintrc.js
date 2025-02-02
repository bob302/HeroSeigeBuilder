module.exports = {
  root: true,
  env: {
    node: true,
    browser: true // If you are working with Vue and the browser environment
  },
  parser: 'vue-eslint-parser', // Use vue-eslint-parser for parsing Vue files
  parserOptions: {
    parser: '@typescript-eslint/parser', // Use the TypeScript parser inside Vue files
    ecmaVersion: 2020, // Supports modern JS features
    sourceType: 'module', // Allows using ES modules
    ecmaFeatures: {
      jsx: false // Enable JSX if you're using Vue with JSX
    }
  },
  extends: [
    'plugin:vue/vue3-essential', // Essential rules for Vue 3
    '@vue/standard', // Standard JS style guide
    '@vue/typescript/recommended', // Recommended TypeScript rules for Vue
    'eslint:recommended', // ESLint's recommended rules
    'plugin:@typescript-eslint/recommended' // TypeScript-specific ESLint rules
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Adjust logging levels
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off', // Adjust debugger levels
    '@typescript-eslint/no-explicit-any': 'off', // Optionally turn off the rule that bans 'any' type
    '@typescript-eslint/explicit-module-boundary-types': 'off' // Allow omitting return types for simplicity
  },
  settings: {
    'vue/typescript': true // Ensure Vue works with TypeScript
  }
}
