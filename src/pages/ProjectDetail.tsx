import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import projectsData from "../content/projects.json";
import type { Project } from "../content/types";
import Markdown from "../components/Markdown";
import NotFound from "./NotFound";

const projects = projectsData as Project[];

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);
  const [body, setBody] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!project) return;
    setBody(null);
    setError(false);
    // Resolve relative to the deployed base so it works on GitHub Pages subpaths.
    const url = `${import.meta.env.BASE_URL}projects/${project.slug}/index.md`;
    fetch(url)
      .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
      .then(setBody)
      .catch(() => setError(true));
  }, [project]);

  if (!project) return <NotFound />;

  const baseUrl = `${import.meta.env.BASE_URL}projects/${project.slug}/`;

  return (
    <article>
      <p className="crumbs">
        <Link to="/projects">← Projects</Link>
      </p>
      <h1>{project.title}</h1>
      <p className="lede">{project.description}</p>
      <div className="card-meta">
        <span className={`status status-${project.status}`}>{project.status}</span>
        {project.categories.map((c) => (
          <span key={c} className="tag">
            {c}
          </span>
        ))}
      </div>
      {project.links.length > 0 && (
        <ul className="link-list">
          {project.links.map((l) => (
            <li key={l.url}>
              <a href={l.url} target="_blank" rel="noreferrer">
                {l.label} →
              </a>
            </li>
          ))}
        </ul>
      )}
      {body !== null && <Markdown source={body} baseUrl={baseUrl} />}
      {body === null && !error && <p className="muted">Loading…</p>}
      {error && (
        <p className="muted">
          No detail page yet. Add <code>public/projects/{project.slug}/index.md</code> to write one.
        </p>
      )}
    </article>
  );
}