import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { site } from "../content/site";
import { writeToClipboard } from "../utils/clipboard";
import MHexMark from "./MHexMark";

type RoleNavTheme = "black" | "paper" | "navy";

const ROLE_ACCENT_DEFAULTS: Record<RoleNavTheme, string> = {
  black: "#66c7ee",
  paper: "#0d9fd1",
  navy: "#c29b43",
};
const ROLE_STRUCTURE_DEFAULTS: Record<RoleNavTheme, string> = {
  black: "#b8aa91",
  paper: "#746f65",
  navy: "#9fadc2",
};

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isCinematicPage = location.pathname === "/cinematic";
  const isRoleNavPage = location.pathname === "/";
  const isMusicPage = location.pathname === "/music";
  const isProjectPage =
    location.pathname === "/projects" || location.pathname.startsWith("/projects/");
  const isProjectDetail = location.pathname.startsWith("/projects/");
  const [roleNavTheme, setRoleNavTheme] = useState<RoleNavTheme>(() => {
    const savedTheme = window.localStorage.getItem("role-nav-theme");
    return savedTheme === "paper" || savedTheme === "navy" ? savedTheme : "black";
  });
  const [roleStructureColor, setRoleStructureColor] = useState(() => {
    const savedColor = window.localStorage.getItem("role-nav-structure-color");
    if (savedColor) return savedColor;

    const savedTheme = window.localStorage.getItem("role-nav-theme");
    const initialTheme = savedTheme === "paper" || savedTheme === "navy" ? savedTheme : "black";
    return ROLE_STRUCTURE_DEFAULTS[initialTheme];
  });
  const [roleAccentColor, setRoleAccentColor] = useState(() => {
    const savedColor = window.localStorage.getItem("role-nav-accent-color");
    if (savedColor) return savedColor;

    const savedTheme = window.localStorage.getItem("role-nav-theme");
    const initialTheme = savedTheme === "paper" || savedTheme === "navy" ? savedTheme : "black";
    return ROLE_ACCENT_DEFAULTS[initialTheme];
  });
  const [isContactMenuOpen, setIsContactMenuOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const contactMenuRef = useRef<HTMLDivElement>(null);
  const emailCopyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    window.localStorage.setItem("role-nav-theme", roleNavTheme);
  }, [roleNavTheme]);

  useEffect(() => {
    window.localStorage.setItem("role-nav-structure-color", roleStructureColor);
  }, [roleStructureColor]);

  useEffect(() => {
    window.localStorage.setItem("role-nav-accent-color", roleAccentColor);
  }, [roleAccentColor]);

  useEffect(() => {
    if (!isContactMenuOpen) return undefined;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!contactMenuRef.current?.contains(event.target as Node)) {
        setIsContactMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsContactMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isContactMenuOpen]);

  useEffect(() => {
    setIsContactMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      if (emailCopyTimerRef.current !== null) {
        window.clearTimeout(emailCopyTimerRef.current);
      }
    };
  }, []);

  const copyEmail = async () => {
    try {
      await writeToClipboard(site.contact.email);
      setEmailCopied(true);
      if (emailCopyTimerRef.current !== null) {
        window.clearTimeout(emailCopyTimerRef.current);
      }
      emailCopyTimerRef.current = window.setTimeout(() => {
        setEmailCopied(false);
        emailCopyTimerRef.current = null;
      }, 1800);
    } catch {
      setEmailCopied(false);
    }
  };

  const renderContactMenu = (variant: "role" | "site") => {
    const isRoleVariant = variant === "role";
    return (
      <div ref={contactMenuRef} className={isRoleVariant ? "role-nav-contact" : "site-contact"}>
        <button
          type="button"
          className={isRoleVariant ? "role-nav-contact-trigger" : "site-contact-trigger"}
          aria-expanded={isContactMenuOpen}
          aria-controls={`${variant}-contact-options`}
          onClick={() => setIsContactMenuOpen((isOpen) => !isOpen)}
        >
          Contact
        </button>
        {isContactMenuOpen && (
          <div
            id={`${variant}-contact-options`}
            className={isRoleVariant ? "role-nav-contact-menu" : "site-contact-menu"}
          >
            <button
              type="button"
              className={isRoleVariant ? "role-nav-contact-option" : "site-contact-option"}
              onClick={copyEmail}
              aria-label={emailCopied ? "email copied" : `copy ${site.contact.email}`}
            >
              {emailCopied ? "email copied!" : "email me"}
            </button>
            <button
              type="button"
              className={isRoleVariant ? "role-nav-contact-option" : "site-contact-option"}
              data-cal-link="mohnjahoney"
              data-cal-config={isRoleVariant ? '{"theme":"dark"}' : '{"theme":"light"}'}
              onClick={() => window.setTimeout(() => setIsContactMenuOpen(false), 0)}
            >
              pick a time
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`page tile-mode-lift${isProjectPage ? " project-page-shell" : ""}${isCinematicPage ? " cinematic-page" : ""}${isRoleNavPage ? ` role-nav-page role-nav-theme-${roleNavTheme}` : ""}${isMusicPage ? " music-page-shell" : ""}${location.pathname === "/mask-experiment" ? " mask-experiment-page" : ""}`}
      style={
        isRoleNavPage
          ? ({
              "--role-structure": roleStructureColor,
              "--role-accent": roleAccentColor,
            } as CSSProperties)
          : undefined
      }
    >
      <header className="site-header">
        {isProjectPage ? (
          <NavLink to="/" className="site-brand" aria-label={`${site.name} — home`}>
            <MHexMark />
          </NavLink>
        ) : isCinematicPage || isRoleNavPage || isMusicPage ? (
          <NavLink to="/" className={`cinematic-brand${isMusicPage ? " music-brand" : ""}`}>
            {isRoleNavPage && <MHexMark />}
            {isMusicPage && <img className="music-brand-mark" src="/jm-mark-brass-ink.svg" alt="" />}
            {site.name}
          </NavLink>
        ) : null}
        <nav className="site-nav">
          {isRoleNavPage ? (
            renderContactMenu("role")
          ) : isMusicPage ? (
            <a href="#music-paths">Contact</a>
          ) : isProjectPage ? (
            <>
              {isProjectDetail && <NavLink to="/projects">Projects</NavLink>}
              {renderContactMenu("site")}
            </>
          ) : (
            <>
              <NavLink to="/" end>
                Home
              </NavLink>
              <NavLink to="/projects">Projects</NavLink>
              <a href={site.resumeUrl} target="_blank" rel="noreferrer">
                Resume
              </a>
            </>
          )}
        </nav>
        {isRoleNavPage ? (
          <div className="role-nav-theme-control" aria-label="Role navigation color theme">
            <span>Color</span>
            <div className="role-nav-theme-options" role="group" aria-label="Choose color theme">
              {(["black", "paper", "navy"] as RoleNavTheme[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  className={roleNavTheme === theme ? "active" : ""}
                  aria-pressed={roleNavTheme === theme}
                  onClick={() => setRoleNavTheme(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
            <label className="role-nav-structure-control">
              <span>Structure</span>
              <input
                type="color"
                value={roleStructureColor}
                onChange={(event) => setRoleStructureColor(event.target.value)}
                aria-label="Choose structure color"
              />
            </label>
            <button
              type="button"
              className="role-nav-structure-reset"
              onClick={() => setRoleStructureColor(ROLE_STRUCTURE_DEFAULTS[roleNavTheme])}
            >
              Reset
            </button>
            <label className="role-nav-accent-control">
              <span>Accent</span>
              <input
                type="color"
                value={roleAccentColor}
                onChange={(event) => setRoleAccentColor(event.target.value)}
                aria-label="Choose accent color"
              />
            </label>
            <button
              type="button"
              className="role-nav-accent-reset"
              onClick={() => setRoleAccentColor(ROLE_ACCENT_DEFAULTS[roleNavTheme])}
            >
              Reset
            </button>
          </div>
        ) : null}
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
