module.exports = {
  root: true,
  env: { browser: true, es2021: true },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "react-hooks", "react-refresh"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  ignorePatterns: ["dist", "node_modules"],
  rules: {
    "react-refresh/only-export-components": "off",
    "@typescript-eslint/no-unused-vars": "off",
  },
};
