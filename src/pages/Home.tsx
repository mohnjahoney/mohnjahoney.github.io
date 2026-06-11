import { Link } from "react-router-dom";
import type { CSSProperties } from "react";
import { site } from "../content/site";
import projectsData from "../content/projects.json";
import type { Project } from "../content/types";
import ProjectCard from "../components/ProjectCard";

const projects = projectsData as Project[];

export default function Home() {
  const featured = projects.slice(0, 3);
  return (
    <>
      <section className="intro">
        <div className="intro-copy">
          <h1>{site.name}</h1>
          <p className="lede">{site.intro}</p>
          <p className="interests">{site.interests.join(" · ")}</p>
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
