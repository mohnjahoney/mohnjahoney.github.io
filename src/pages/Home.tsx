import { Link } from "react-router-dom";
import { useState, type CSSProperties } from "react";
import { site } from "../content/site";
import { projects } from "../content/projects/index";
import ProjectCard from "../components/ProjectCard";
import { writeToClipboard } from "../utils/clipboard";

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await writeToClipboard(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      className="contact-action contact-email-button"
      onClick={copyEmail}
      title="Copy email address"
      aria-label={copied ? "Email copied" : `Copy ${email}`}
    >
      {copied ? "Copied!" : email}
      <svg className="copy-email-icon" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="5.5" y="2.5" width="8" height="8" rx="1" />
        <path d="M10.5 12.5v1h-7a1 1 0 0 1-1-1v-7h1" />
      </svg>
      <span className="visually-hidden" role="status" aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </button>
  );
}

function ContactActions({ email }: { email: string }) {
  return (
    <div className="contact-actions" aria-label="Contact options">
      <button
        type="button"
        className="contact-action contact-schedule-button"
        data-cal-link="mohnjahoney"
        data-cal-config='{"theme":"light"}'
      >
        Find a time to talk
      </button>
      <CopyEmail email={email} />
    </div>
  );
}

export default function Home() {
  const featured = projects.slice(0, 3);
  return (
    <>
      <section className="intro">
        <div className="intro-copy">
          <h1>{site.name}</h1>
          <p className="lede">
            {site.intro} I’m always interested in feedback and conversations with curious people.
          </p>
          <p className="interests">{site.interests.join(" · ")}</p>
          <ContactActions email={site.contact.email} />
        </div>
        <div className="avatar-frame" style={{ "--avatar-size": site.photoSize } as CSSProperties}>
          <img
            src={site.photo}
            alt={site.name}
            className={`avatar avatar-default avatar-${site.photoShape}`}
          />
          <img
            src="profile-photo-transparent-BLUE.png"
            alt=""
            className={`avatar avatar-hover avatar-${site.photoShape}`}
          />
        </div>
      </section>

      <div className="feature-grid">
        {site.featuredAreas.map((area) => (
          <a key={area.title} href={area.url} target="_blank" rel="noreferrer" className="feature">
            <img src={area.image} alt={area.imageAlt} className="feature-image" />
            <div>
              <h2>{area.title}</h2>
              <p>{area.text}</p>
            </div>
          </a>
        ))}
      </div>

      <section className="section">
        <h2>Projects</h2>
        <div className="card-grid">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
        <p className="more">
          <Link to="/projects">All projects →</Link>
        </p>
      </section>

      <section className="section">
        <h2>Contact</h2>
        <ul className="contact-list">
          <li>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </li>
          <li>
            <a href={site.contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
          {site.contact.linkedin && (
            <li>
              <a href={site.contact.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          )}
          <li>
            <a href={site.resumeUrl} target="_blank" rel="noreferrer">
              Resume (PDF)
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
