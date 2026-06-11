import { useMemo, useState } from "react";
import projectsData from "../content/projects.json";
import type { Project } from "../content/types";
import ProjectCard from "../components/ProjectCard";

const projects = projectsData as Project[];

export default function Projects() {
  const [active, setActive] = useState<string | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((p) => p.categories.forEach((c) => set.add(c)));
    return Array.from(set).sort();
  }, []);

  const filtered = active ? projects.filter((p) => p.categories.includes(active)) : projects;

  return (
    <>
      <h1>Projects</h1>
      <p className="lede">
        Experiments, prototypes, and finished work. A mix of polished and unfinished things.
      </p>
      <div className="filters">
        <button
          className={active === null ? "filter active" : "filter"}
          onClick={() => setActive(null)}
        >
          All
        </button>
        {tags.map((t) => (
          <button
            key={t}
            className={active === t ? "filter active" : "filter"}
            onClick={() => setActive(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="card-grid">
        {filtered.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </>
  );
}
