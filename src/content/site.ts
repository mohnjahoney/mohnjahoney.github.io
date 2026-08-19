// Edit this file to update your name, bio, and external links.
export type PhotoShape = "circle" | "rounded" | "rect";

export const site = {
  name: "John Mahoney",
  // photo: "profile-photo.png",
  photo: "profile-photo-transparent.png",
  // Easy profile-photo controls:
  // shape can be "circle", "rounded", or "rect"; size accepts any CSS length.
  photoShape: "rounded" as PhotoShape,
  photoSize: "220px",
  intro:
    "I build and explore things inspired by science, learning, software, music, games, and other curious corners of the world.",
  // "I build educational software, scientific tools, and interactive explanations. My work blends programming, visual design, interaction design, and a long-running interest in how people understand complex systems.",
  interests: [
    "Software",
    "Physics",
    "Education",
    "Visualization",
    "AI/ML",
    "Music",
  ],
  featuredAreas: [
    {
      title: "Educational Software",
      // image: "featured/brilliant-work.svg",
      image: "featured/brilliant.png",
      imageAlt: "Layered interface panels representing interactive educational software.",
      // text: "A selection of work from Brilliant.org, an edtech company known for high-quality interactive courses. My role sat closest to software development, with substantial educational design, visual design, and interaction design mixed in.",
      text: "During my time at Brilliant.org, I worked on interactive courses spanning math, computer science, and physics. My role was closest to software engineering, and also involved curriculum design, visual design, and interaction design.",
      url: "https://mohnjahoney.github.io/brilliant-portfolio-page",
      linkLabel: "Work from Brilliant",
    },
    {
      title: "Scientific Research",
      // image: "featured/scientific-research.svg",
      image: "featured/BIMs-research.png",
      imageAlt: "Abstract research diagram with curves, points, and notation.",
      text: "Academic work in nonlinear dynamics, complex systems, and information theory. This section points toward publications and research artifacts.",
      url: "https://mohnjahoney.github.io/academic-portfolio-page/",
      linkLabel: "Academic portfolio",
    },
  ],
  resumeUrl: "resume.pdf",
  // Disable this to swap the contact text without animation.
  contactAnimation: {
    flip: true,
  },
  contact: {
    email: "mohnjahoney@gmail.com",
    github: "https://github.com/mohnjahoney",
    linkedin: "https://www.linkedin.com/in/johnmahoney3/",
  },
};
