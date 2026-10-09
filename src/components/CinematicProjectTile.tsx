import { Link } from "react-router-dom";
import type { ProjectDefinition } from "../content/defineProject";

export default function CinematicProjectTile({ project }: { project: ProjectDefinition }) {
  const content = (
    <>
      {project.thumbnail && <img src={project.thumbnail} alt="" loading="lazy" />}
      <span>{project.title}</span>
    </>
  );

  if (project.detail) {
    return (
      <Link to={`/projects/${project.slug}`} className="cinematic-project-tile">
        {content}
      </Link>
    );
  }

  const external = project.links[0]?.url;
  if (external) {
    return (
      <a href={external} target="_blank" rel="noreferrer" className="cinematic-project-tile">
        {content}
      </a>
    );
  }

  return <div className="cinematic-project-tile">{content}</div>;
}
