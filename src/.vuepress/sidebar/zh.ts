import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    {
      text: "Android",
      icon: "android",
      prefix: "android/",
      children: [
        {
          text: "目录",
          link: "README.md"
        },
        {
          text: "android异步处理",
          link: "async.md",
        }
      ]
    },
    {
      text: "Go",
      icon: "/golang_mole.svg",
      prefix: "go/",
      children:[
        {
          text: "matrix",
          link: "go-matrix.md"
        }
      ]
    },
    {
      text:"Mac",
      icon:"mac",
      prefix:"mac/",
      children:[

      ]
    },
    "intro",
  ],
});
