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
        icon: "/golang_mole.svg",
        link: "go/"
      },
      {
        text:"mac",
        icon:"mac",
        link:"mac/"
      },
    ],
  },
  // {
  //   text: "V2 文档",
  //   icon: "note",
  //   link: "https://theme-hope.vuejs.press/zh/",
  // },
]);
