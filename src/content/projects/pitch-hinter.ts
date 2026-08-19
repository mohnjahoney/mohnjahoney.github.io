import { defineProject, markdown } from "../defineProject";

export default defineProject({
  slug: "pitch-hinter",
  title: "pitch-hinter",
  summary:
    "A browser-based pitch-detection lab.",
  status: "prototype",
  categories: ["Music & Computation", "Experimental / Artistic"],
  thumbnail: "projects/pitch-hinter/thumbnail.png",
  links: [],
  detail: {
    overview: markdown`
      \`pitch hinter\` is a browser-based experiment for exploring microphone input, algorithm confidence, and real-time musical feedback."
    `,
    conversationStarter: {
      title: "Curious about this too?",
      body: "I’d love to compare notes about the space between pitch-detection accuracy and feedback that actually feels useful to a musician.",
      audiences: [
        "musicians",
        "music educators",
        "browser-audio developers",
        "signal-processing tinkerers",
      ],
      ctaLabel: "Get in touch",
    },
    body: markdown`
      ## What it does

      The project started as a small pitch lab: a place to compare pitch detection
      algorithms, inspect confidence values, and understand how raw microphone input
      turns into musical pitch data. The first implemented detector uses
      Pitchy / McLeod, with additional autocorrelation and YIN-style experiments
      giving the interface room to become a more complete comparison tool.

      Beyond pitch extraction, the interesting part is the feedback layer. \`pitch
      hinter\` includes filter-chain ideas like confidence gates, median filtering,
      EMA smoothing, hold-last behavior, and jump limiting. Those tools make it
      possible to study the messy design space between signal processing and a
      musical interface that feels readable to a human.

      ## Focus areas

      - Real-time microphone input in the browser
      - Pitch detection and confidence visualization
      - Comparing raw detector output with filtered pitch traces
      - Musical-interface design for noisy, continuous input

      ![Pitch Hinter screenshot](screenshot.png)
    `,
  },
});
