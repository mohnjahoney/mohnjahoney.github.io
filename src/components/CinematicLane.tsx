import type { ProjectDefinition } from "../content/defineProject";
import CinematicProjectTile from "./CinematicProjectTile";

export default function CinematicLane({
  label,
  projects,
}: {
  label: string;
  projects: ProjectDefinition[];
}) {
  return (
    <section className="cinematic-lane" aria-labelledby={`cinematic-lane-${label}`}>
      <h2 id={`cinematic-lane-${label}`}>{label}</h2>
      <div className="cinematic-lane-track">
        {projects.map((project) => (
          <CinematicProjectTile key={project.slug} project={project} />
        ))}
      </div>
    </section>
  );
}
