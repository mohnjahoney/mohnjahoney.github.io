import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { site } from "../content/site";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="page">
      <header className="site-header">
        <nav className="site-nav">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <a href={site.resumeUrl} target="_blank" rel="noreferrer">
            Resume
          </a>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <span>
          © {new Date().getFullYear()} {site.name}
        </span>
      </footer>
    </div>
  );
}
