import { defineProject, markdown } from "../defineProject";

export default defineProject({
  slug: "crack",
  title: "CRACK!",
  summary: "Silly games for creative kids.",
  status: "prototype",
  categories: ["Games", "Web Development", "Silly / Weird"],
  thumbnail: "projects/crack/thumbnail.png",
  links: [{ label: "GitHub", url: "https://github.com/yourhandle/example-one" }],
  detail: {
    overview:
      "CRACK! is a suite of browser-based games that emphasize silliness, laughter, and creative use of technology.",
    body: markdown`
      ![CRACK!](screenshot.png)

      ## ThingamaPuppet

      Players sample various parts of themselves, for example their eye, either recorded or real-time, and assemble these pieces into a puppet that they can control with their hand.

      The goal of this game is simply to have fun creating something bizarre.

      ![ThingamaPuppet](thingamapuppet.png)
    `,
  },
});
