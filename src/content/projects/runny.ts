import { defineProject, markdown } from "../defineProject";

export default defineProject({
  slug: "runny",
  title: "runny",
  summary:
    "A lightweight local development orchestrator for launching projects, tracking ports, and keeping dev servers visible.",
  status: "active",
  categories: ["Useful Tools", "Developer Tools"],
  thumbnail: "projects/runny/thumbnail.png",
  links: [{ label: "GitHub", url: "https://github.com/mohnjahoney/runny" }],
  detail: {
    overview: markdown`
      \`runny\` is a lightweight local development orchestrator for personal projects.
      It is meant to make starting, observing, and cleaning up local dev servers feel
      less scattered.
    `,
    conversationStarter: {
      title: "Do you wrestle with this too?",
      body: "I’d enjoy hearing how other developers keep a constellation of local projects understandable—and where runny’s approach feels useful or gets in the way.",
      audiences: [
        "developers with too many side projects",
        "terminal-tool builders",
        "people who care about humane developer tooling",
      ],
      ctaLabel: "Share your perspective",
    },
    body: markdown`
      ## What it does

      Instead of manually juggling commands, ports, browser windows, and lingering
      processes across projects, \`runny\` acts as a small developer control plane. From
      inside a project directory, it can launch the development server, observe the
      actual port that opens, keep track of running processes, and surface the state
      of local projects in a live terminal interface.

      The goal is not to become a heavy production orchestration system. Runny is
      intended to feel ambient and pleasant: enough structure to reduce terminal
      clutter and PID hunting, but light enough to stay out of the way.

      ## Usage

      From within the project directory, simply type \`runny\`.
      The process will start, \`runny\` will find an appropriate port and set up the server.

      You can view and manage processes from the \`runny dashboard\`.
      This is opened automatically when \`runny\` is launched.

      ~~~sh
      cd ~/my_project
      runny
      ~~~

      ## Focus areas

      - Local dev-server launching and process tracking
      - Port visibility, especially for Vite and other common frontend tools
      - Cleanup workflows for stale or confusing local servers
      - A small TUI dashboard for project status

      ![Runny screenshot](screenshot.png)

      ## Coming soon

      - Browser based view / control
      - Suggestions for code fixes based on errors and warnings
    `,
  },
});
