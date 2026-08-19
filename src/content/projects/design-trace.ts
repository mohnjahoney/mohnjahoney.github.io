import { defineProject, markdown } from "../defineProject";

export default defineProject({
  slug: "design-trace",
  title: "design-trace",
  summary: "Inspect a web element to learn *what* and *why*.",
  status: "prototype",
  categories: ["Utility"],
  thumbnail: "projects/design-trace/design-trace.png",
  links: [{ label: "Visit site", url: "https://example.com" }],
  detail: {
    overview:
      "`design-trace` is a developer tool for understanding why a rendered UI looks the way it does.",
    body: markdown`
      It inspects elements in the browser and traces visual properties like color, typography, spacing, borders, and shadows through the CSS variables and design tokens that produced them.

      Instead of stopping at a computed value, \`design-trace\` shows the chain behind it: from the rendered property, through semantic and component tokens, down to the final browser value.

      It is an early MVP focused on runtime inspection and token tracing. Source-code mapping is planned, but not yet available.

      ![design-trace thumbnail](design-trace.png)
    `,
  },
});
