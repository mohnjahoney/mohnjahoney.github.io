import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import RoleNavCanvas from "./RoleNavCanvas";
import "./role-nav.css";

type Role = {
  id: string;
  label: string;
  preview: string;
  image?: string;
  href: string;
  color: string;
};

const roles: Role[] = [
  {
    id: "physicist",
    label: "Physicist & Applied Mathematician",
    preview: "Research, modeling, and making hidden structure visible.",
    image: "/featured/BIMs-research-cleaned.png",
    href: "https://mohnjahoney.github.io/academic-portfolio-page/",
    color: "blue",
  },
  {
    id: "learning",
    label: "Interactive Learning Designer",
    preview: "Interactive courses that make difficult ideas tangible.",
    image: "/featured/brilliant.png",
    href: "https://mohnjahoney.github.io/brilliant-portfolio-page",
    color: "cyan",
  },
  {
    id: "software",
    label: "Independent Software Builder",
    preview: "Small tools, experiments, and software built from curiosity.",
    image: "/projects/node-nav/thumbnail.png",
    href: "/projects",
    color: "pale",
  },
  {
    id: "music",
    label: "Musician & Composer",
    preview: "Sound, structure, and expressive systems.",
    href: "/music",
    color: "pale",
  },
];

const PREVIEW_COLLAPSE_DURATION_MS = 150;
const PREVIEW_REVEAL_ENERGY = 4;

function RolePreview({ role, interactive }: { role: Role; interactive: boolean }) {
  const content = (
    <>
      {role.image ? (
        <img src={role.image} alt="" />
      ) : (
        <div
          className={`role-nav-music-visual role-nav-music-visual-${role.color}`}
          aria-hidden="true"
        >
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      )}
      <div className="role-nav-preview-copy">
        <span>Explore</span>
        <p>{role.preview}</p>
      </div>
    </>
  );

  if (role.href.startsWith("/")) {
    return (
      <Link
        to={role.href}
        className="role-nav-preview-link"
        tabIndex={interactive ? 0 : -1}
        aria-hidden={!interactive}
      >
        {content}
      </Link>
    );
  }

  return (
    <a
      href={role.href}
      className="role-nav-preview-link"
      tabIndex={interactive ? 0 : -1}
      aria-hidden={!interactive}
    >
      {content}
    </a>
  );
}

function RoleLabelLink({ role, onFocus }: { role: Role; onFocus: () => void }) {
  if (role.href.startsWith("/")) {
    return (
      <Link to={role.href} className="role-nav-option-link" onFocus={onFocus}>
        {role.label}
      </Link>
    );
  }

  return (
    <a href={role.href} className="role-nav-option-link" onFocus={onFocus}>
      {role.label}
    </a>
  );
}

export default function RoleNav() {
  const [activeRoleId, setActiveRoleId] = useState(roles[0].id);
  const [selectedRoleId, setSelectedRoleId] = useState(roles[0].id);
  const [nucleusEnergy, setNucleusEnergy] = useState(PREVIEW_REVEAL_ENERGY);
  const [isSelfImpacting, setIsSelfImpacting] = useState(false);
  const [isCollapsingPreview, setIsCollapsingPreview] = useState(false);
  const roleDotRefs = useRef<Record<string, HTMLElement | null>>({});
  const previewRef = useRef<HTMLDivElement>(null);
  const pendingRoleIdRef = useRef<string | null>(null);
  const collapseTimerRef = useRef<number | null>(null);
  const selfImpactTimerRef = useRef<number | null>(null);
  const activeRole = roles.find((role) => role.id === activeRoleId) ?? roles[0];

  const handleNucleusImpact = useCallback((energy: number) => {
    setNucleusEnergy((currentEnergy) => Math.max(currentEnergy, energy));
  }, []);

  useEffect(() => {
    return () => {
      if (collapseTimerRef.current !== null) {
        window.clearTimeout(collapseTimerRef.current);
      }
      if (selfImpactTimerRef.current !== null) {
        window.clearTimeout(selfImpactTimerRef.current);
      }
    };
  }, []);

  const handleSelfNucleusImpact = useCallback(() => {
    setIsSelfImpacting(true);
    if (selfImpactTimerRef.current !== null) {
      window.clearTimeout(selfImpactTimerRef.current);
    }
    selfImpactTimerRef.current = window.setTimeout(() => {
      setIsSelfImpacting(false);
      selfImpactTimerRef.current = null;
    }, 1000);
  }, []);

  const activateRole = useCallback((roleId: string) => {
    if (roleId === activeRoleId && !isCollapsingPreview) return;

    // Keep the previous card mounted while it quickly folds back into its nucleus.
    // The canvas sees the new active role only after that collapse, so each path
    // begins from the newly selected role dot.
    pendingRoleIdRef.current = roleId;
    setSelectedRoleId(roleId);
    setNucleusEnergy(0);
    setIsCollapsingPreview(true);

    if (collapseTimerRef.current !== null) {
      window.clearTimeout(collapseTimerRef.current);
    }
    collapseTimerRef.current = window.setTimeout(() => {
      const pendingRoleId = pendingRoleIdRef.current;
      if (pendingRoleId) setActiveRoleId(pendingRoleId);
      setIsCollapsingPreview(false);
      collapseTimerRef.current = null;
    }, PREVIEW_COLLAPSE_DURATION_MS);
  }, [activeRoleId, isCollapsingPreview]);

  return (
    <div className="role-nav-home">
      <RoleNavCanvas
        activeRoleId={activeRole.id}
        roleAnchorRefs={roleDotRefs}
        previewAnchorRef={previewRef}
        onNucleusImpact={handleNucleusImpact}
        onSelfNucleusImpact={handleSelfNucleusImpact}
        idleEnabled={nucleusEnergy < PREVIEW_REVEAL_ENERGY}
      />
      <section className="role-nav-stage" aria-label="Areas of work">
        <div className="role-nav-list">
          <h2 className="role-nav-list-label">I work as /</h2>
          <div className="role-nav-options">
            {roles.map((role) => {
              return (
                <div
                  key={role.id}
                  className={`role-nav-option${role.id === selectedRoleId ? " active" : ""}`}
                  onMouseEnter={() => activateRole(role.id)}
                >
                  <RoleLabelLink role={role} onFocus={() => activateRole(role.id)} />
                  <button
                    type="button"
                    className="role-nav-dot-button"
                    onFocus={() => activateRole(role.id)}
                    onClick={() => activateRole(role.id)}
                    aria-label={`Preview ${role.label}`}
                    aria-pressed={role.id === selectedRoleId}
                  >
                    <i
                      ref={(node) => {
                        roleDotRefs.current[role.id] = node;
                      }}
                      className={`role-nav-dot role-nav-dot-${role.color}`}
                      aria-hidden="true"
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
        <div
          ref={previewRef}
          className={`role-nav-preview role-nav-preview-stage-${nucleusEnergy}${
            isCollapsingPreview ? " is-collapsing" : ""
          }${isSelfImpacting ? " is-self-impacting" : ""}`}
          aria-live="polite"
        >
          <RolePreview role={activeRole} interactive={nucleusEnergy === PREVIEW_REVEAL_ENERGY} />
        </div>
      </section>
    </div>
  );
}
