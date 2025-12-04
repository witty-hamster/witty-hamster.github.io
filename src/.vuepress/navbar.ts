import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "博文",
    icon: "pen-to-square",
    prefix: "/posts/",
    children: [
      {
        text: "收集箱",
        icon: "pen-to-square",
        prefix: "收集箱/",
        children: []
      },
      {
        text: "git",
        icon: "pen-to-square",
        prefix: "git指南/",
        children: [
          { text: "同一份代码推送到两个远程", icon: "pen-to-square", link: "如何将同一份代码分别推送到 github和 gitee 上" }
        ]
      },
      "小技巧"
    ],
  }
]);
