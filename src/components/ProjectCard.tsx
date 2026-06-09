import { Link } from "react-router-dom";
import type { Project } from "../content/types";

export default function ProjectCard({ project }: { project: Project }) {
  const inner = (
    <>
      {project.thumbnail && (
        <div className="card-thumb">
          <img src={project.thumbnail} alt="" loading="lazy" />
        </div>
      )}
      <div className="card-body">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="card-meta">
          <span className={`status status-${project.status}`}>{project.status}</span>
          {project.categories.slice(0, 2).map((c) => (
            <span key={c} className="tag">
              {c}
            </span>
          ))}
        </div>
      </div>
    </>
  );

  if (project.hasDetailPage) {
    return (
      <Link to={`/projects/${project.slug}`} className="card">
        {inner}
      </Link>
    );
  }

  const external = project.links[0]?.url;
  if (external) {
    return (
      <a href={external} target="_blank" rel="noreferrer" className="card">
        {inner}
      </a>
    );
  }
  return <div className="card">{inner}</div>;
}