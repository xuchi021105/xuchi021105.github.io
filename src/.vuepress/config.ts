import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  lang: "zh-CN",
  title: "主页",
  description: "徐迟的博客",

  theme:theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
