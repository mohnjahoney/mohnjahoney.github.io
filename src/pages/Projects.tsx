import { useMemo, useState } from "react";
import { projects } from "../content/projects/index";
import ProjectCard from "../components/ProjectCard";

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
      <section className="projects-hero">
        <div className="projects-hero-copy">
          <h1>Independent Software Work</h1>
          <p className="lede">Tools, experiments, and finished work.</p>
        </div>
        <div className="projects-filter-panel">
          <p className="projects-filter-label">Browse by focus</p>
          <div className="filters" role="group" aria-label="Filter projects by focus">
            <button
              className={active === null ? "filter active" : "filter"}
              aria-pressed={active === null}
              onClick={() => setActive(null)}
            >
              All
            </button>
            {tags.map((t) => (
              <button
                key={t}
                className={active === t ? "filter active" : "filter"}
                aria-pressed={active === t}
                onClick={() => setActive(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="card-grid">
        {filtered.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </div>
    </>
  );
}
