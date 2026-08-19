import { defineProject, markdown } from "../defineProject";

export default defineProject({
  slug: "simpsons-paradox",
  title: "simpsons-paradox",
  summary: "Learn about Simpson's Paradox through an interactive lesson.",
  status: "prototype",
  categories: ["Education", "Web Development"],
  thumbnail: "projects/simpsons-paradox/thumbnail.png",
  links: [{ label: "Visit site", url: "https://example.com" }],
  detail: {
    overview: markdown`
      \`simpsons-paradox\` is an interactive lesson about Simpson's Paradox.

      It contains a sequence of examples that highlight different ways this paradox can appear.
      It uses different contexts and varying modes of interaction.
    `,
    body: markdown`
      ![simpsons-paradox-screenshot1](screenshot1.png)
      ![simpsons-paradox-screenshot2](screenshot2.png)
      ![simpsons-paradox-screenshot3](screenshot3.png)
      ![simpsons-paradox-screenshot4](screenshot4.png)
      ![simpsons-paradox-screenshot5](screenshot5.png)
      ![simpsons-paradox-screenshot6](screenshot6.png)
    `,
  },
});
