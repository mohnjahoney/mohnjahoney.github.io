import { projects } from "../content/projects/index";
import { site } from "../content/site";
import CinematicLane from "../components/CinematicLane";
import SplitProfile from "../components/SplitProfile";

export default function CinematicHome() {
  const midpoint = Math.ceil(projects.length / 2);

  return (
    <div className="cinematic-home">
      <p className="cinematic-kicker">Experimental layout</p>
      <section className="cinematic-hero">
        <SplitProfile />
        <div>
          <p>{site.intro}</p>
        </div>
      </section>
      <div className="cinematic-lanes">
        <CinematicLane label="Independent projects" projects={projects.slice(0, midpoint)} />
        <CinematicLane label="More work" projects={projects.slice(midpoint)} />
      </div>
    </div>
  );
}
