import { defineProject, markdown } from "../defineProject";

export default defineProject({
  slug: "small-website-builds",
  title: "Small Website Builds",
  summary:
    "A group of calm, content-focused websites for musicians, performance projects, personal portfolios, and local organizations.",
  status: "active",
  categories: ["Useful Tools", "Experimental / Artistic"],
  thumbnail: "projects/small-website-builds/thumbnail.svg",
  links: [
    {
      label: "Personal site",
      url: "https://mohnjahoney.github.io",
    },    
    {
      label: "Professional musician",
      url: "https://mohnjahoney.github.io/john-mahoney-jr-website",
    },
    {
      label: "Gordon Lightfoot Project",
      url: "https://mohnjahoney.github.io/gordon-lightfoot-project",
    },
    {
      label: "Artist portfolio",
      url: "https://rdkc.com",
    },
    {
      label: "Educator Profile",
      url: "https://mohnjahoney.github.io/zach-cowan-educator-percussionist",
    },
  ],
  detail: {
    overview: markdown`
      Here are a few small website builds that share a similar design
      space: a focused public home for real people, performances, or local
      organizations. I focus on clear visuals, fluid information flow, and just the right amount of individual flavor.
    `,
    conversationStarter: {
      title: "Does this overlap with your world?",
      body: "I’d enjoy talking with people who need or design small, thoughtful websites with personal touch.",
      audiences: [
        "musicians and artists",
        "educators",
        "community organizations",
        "designers and writers",
      ],
      ctaLabel: "Start a conversation",
    },
    body: markdown`
      ![Personal portfolio icon](icon-personal.svg)

      ## Personal portfolio

      This site is part of the same body of work. It is a lightweight static portfolio
      designed around clear writing, restrained visual identity, project cards, and
      GitHub Pages deployment. The homepage has to hold educational software,
      scientific research, music-adjacent experiments, developer tools, and small
      website builds without letting any one category dominate the whole identity.

      ![Professional musician site icon](icon-musician.svg)

      ## Professional musician site

      This example is a simple, tasteful site for a professional
      musician: voice, guitar, and acoustic performance. The content centers selected
      recordings, performance history, upcoming dates, and booking contact.
      The design goal is grounded and mature without clutter or aggressive promotion.

      ![Gordon Lightfoot Project icon](icon-lightfoot.svg)

      ## Gordon Lightfoot Project

      The Gordon Lightfoot Project site has a related challenge: present a group of
      musicians performing songs they love while avoiding the feeling of a flashy
      tribute act or nostalgia product. The site direction emphasizes live
      performance, ensemble identity, and a calm sense of musical
      craft. The central line of the project is a tribute to the writing, not an
      imitation of the man.

      ![Zach Cowan site icon](icon-zach.svg)

      ## Zach Cowan educator and percussionist site

      This one-page site positions Zach Cowan as both an independent math educator and
      a deeply trained percussionist. The design direction is calm, grounded, and
      high-trust: clear math support and rhythm instruction.

      ![RKDC site icon](icon-rdkc.svg)

      ## RKDC

      The RKDC work belongs in the same family of small, identity-sensitive websites:
      clear structure, careful visual tone, and enough polish to feel public without
      overbuilding the technology. The site presents Rachel D.K. Clark as a
      contemporary folk artist and educator whose wearable art, quilts, patterns, and
      instructional work draw from family sewing traditions, vivid fabric
      combinations, humor, and traditional quilt making.

      ## Why group these?

      These sites show lightweight frontend development, restrained
      visual design, content organization, deployment judgment, and an ability to
      match a site's interface to the emotional tone of the person or group it
      represents.
    `,
  },
});
