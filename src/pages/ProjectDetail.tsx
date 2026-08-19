import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { projects } from "../content/projects/index";
import { site } from "../content/site";
import type { ConversationStarter } from "../content/defineProject";
import Markdown from "../components/Markdown";
import { writeToClipboard } from "../utils/clipboard";
import NotFound from "./NotFound";

function ConversationStarterCard({ starter }: { starter: ConversationStarter }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  async function copyEmail() {
    try {
      await writeToClipboard(site.contact.email);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <aside className="conversation-starter" aria-labelledby="conversation-starter-title">
      <svg className="conversation-starter-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 5.5h14v10H9l-4 3v-13Z" />
      </svg>
      <h2 id="conversation-starter-title">{starter.title}</h2>
      <p>{starter.body}</p>
      <ul className="conversation-audiences" aria-label="People I’d especially enjoy hearing from">
        {starter.audiences.map((audience) => (
          <li key={audience}>{audience}</li>
        ))}
      </ul>
      <button type="button" className="conversation-cta" onClick={copyEmail}>
        {copied ? "Email copied ✓" : starter.ctaLabel}
      </button>
    </aside>
  );
}

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  if (!project || !project.detail) return <NotFound />;

  const baseUrl = `${import.meta.env.BASE_URL}projects/${project.slug}/`;
  const { detail } = project;

  return (
    <article>
      <p className="crumbs">
        <Link to="/projects">← Projects</Link>
      </p>
      <h1>{project.title}</h1>
      <p className="lede">{project.summary}</p>
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
      <div
        className={`project-detail-content${detail.conversationStarter ? " has-conversation" : ""}`}
      >
        {detail.conversationStarter && (
          <ConversationStarterCard starter={detail.conversationStarter} />
        )}
        <div className="project-overview-copy">
          <Markdown source={detail.overview} baseUrl={baseUrl} />
        </div>
        <div className="project-detail-body">
          <Markdown source={detail.body} baseUrl={baseUrl} />
        </div>
      </div>
    </article>
  );
}
