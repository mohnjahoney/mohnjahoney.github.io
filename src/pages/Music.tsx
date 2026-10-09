import { useState } from "react";
import { writeToClipboard } from "../utils/clipboard";

export default function Music() {
  const [copiedLessonContact, setCopiedLessonContact] = useState(false);
  const musicLessonsEmail = "mohnjahoney+musiclessons@gmail.com";

  async function copyLessonEmail() {
    try {
      await writeToClipboard(musicLessonsEmail);
      setCopiedLessonContact(true);
      window.setTimeout(() => setCopiedLessonContact(false), 2400);
    } catch {
      setCopiedLessonContact(false);
    }
  }

  return (
    <article className="music-page">
      <section className="music-hero" aria-labelledby="music-title">
        <div className="music-hero-copy">
          <p className="music-kicker">Saxophone · Piano · Musicianship</p>
          <h1 id="music-title">Musician, composer &amp; teacher</h1>
          <p className="music-intro">
            I’m a musician, composer, and multi-instrumentalist with decades of experience across
            jazz, Latin, funk, and experimental music. Saxophone and piano are my primary
            instruments, and my work spans performance, writing, arranging, and recording.
          </p>
        </div>
        <figure className="music-hero-photo">
          <img src="/sax old soul square.PNG" alt="John Mahoney playing tenor saxophone live" />
          <figcaption>Tenor saxophone · live at Old Soul</figcaption>
        </figure>
      </section>

      <section id="music-paths" className="music-statement" aria-label="Musical practice">
        <div>
          <p className="music-kicker">Current work</p>
          <h2>Writing, arranging, and teaching.</h2>
        </div>
        <div className="music-statement-copy">
          <p>
            Alongside live performance, I spend significant time writing and arranging—especially
            for solo piano. My musical practice moves between ensemble work, improvisation,
            composition, and the particular discipline of solo work.
          </p>
          <p>
            I teach saxophone, piano, and musicianship, and currently have a limited number of
            openings. I work with students who want to deepen their technique, listening, creative
            fluency, and relationship with their instrument—whatever it is.
          </p>
          <button
            type="button"
            className="music-contact-link"
            onClick={copyLessonEmail}
          >
            {copiedLessonContact ? "Email copied!" : "Inquire about lessons"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </article>
  );
}
