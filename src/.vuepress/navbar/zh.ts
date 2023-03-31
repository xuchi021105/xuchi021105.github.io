import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/",
  {
    text: "blog",
    icon: "edit",
    children: [
      {
        text: "android",
        icon: "android",
        link: "android/"
      },
      {
        text: "go",
        icon: "golang",
        link: "go/"
      },
    ],
  },
  // {
  //   text: "V2 文档",
  //   icon: "note",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
