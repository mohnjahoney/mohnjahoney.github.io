import { Link } from "react-router-dom";
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
        <img src={site.photo} alt={site.name} className="avatar" />
        <div>
          <h1>{site.name}</h1>
          <p className="lede">{site.intro}</p>
          <p className="interests">{site.interests.join(" · ")}</p>
        </div>
      </section>

      <section className="section">
        <h2>Teaching</h2>
        <p>
          <a href={site.teachingUrl} target="_blank" rel="noreferrer">
            Teaching portfolio →
          </a>
        </p>
      </section>

      <section className="section">
        <h2>Research</h2>
        <p>
          <a href={site.researchUrl} target="_blank" rel="noreferrer">
            Academic portfolio →
          </a>
        </p>
      </section>

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