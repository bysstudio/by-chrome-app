import eslintConfig from "@electron-toolkit/eslint-config";
import eslintConfigPrettier from "@electron-toolkit/eslint-config-prettier";
import eslintPluginVue from "eslint-plugin-vue";

export default [
  { ignores: ["**/node_modules", "**/dist", "**/out"] },
  eslintConfig,
  ...eslintPluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,vue}"],
    rules: {
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": "off",
      // 关闭缩进检查
      indent: "off",
      // 关闭分号检查
      semi: "off",
      // 关闭引号检查
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,  // 允许双引号
          endOfLine: "auto"     // 自动换行符
        }
      ]

    }
  },

  eslintConfigPrettier
];
