import { Link } from "react-router-dom";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { site } from "../content/site";
import { projects } from "../content/projects/index";
import ProjectCard from "../components/ProjectCard";
import { writeToClipboard } from "../utils/clipboard";

gsap.registerPlugin(SplitText);

type ContactEffects = {
  flip: boolean;
};

function CopyEmail({ email, effects }: { email: string; effects: ContactEffects }) {
  const [copied, setCopied] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const prompt = useRef<HTMLSpanElement>(null);
  const address = useRef<HTMLSpanElement>(null);
  const confirmation = useRef<HTMLSpanElement>(null);
  const promptText = useRef<HTMLSpanElement>(null);
  const addressText = useRef<HTMLSpanElement>(null);
  const promptChars = useRef<HTMLElement[]>([]);
  const addressChars = useRef<HTMLElement[]>([]);
  const visibleLayer = useRef<"prompt" | "address" | "confirmation">("prompt");
  const activeTimeline = useRef<gsap.core.Timeline | null>(null);
  const resetTimer = useRef<number | undefined>(undefined);
  const hovered = useRef(false);
  const keyboardFocused = useRef(false);

  useLayoutEffect(() => {
    const promptSplit = SplitText.create(promptText.current, {
      type: "chars",
      charsClass: "copy-email-char",
      tag: "span",
      aria: "none",
    });
    const addressSplit = SplitText.create(addressText.current, {
      type: "chars",
      charsClass: "copy-email-char",
      tag: "span",
      aria: "none",
    });
    promptChars.current = promptSplit.chars;
    addressChars.current = addressSplit.chars;

    const layers = [prompt.current, address.current, confirmation.current];
    const animatedElements = [...layers, ...promptSplit.chars, ...addressSplit.chars];
    gsap.set([address.current, confirmation.current], {
      autoAlpha: 0,
    });

    return () => {
      window.clearTimeout(resetTimer.current);
      activeTimeline.current?.kill();
      gsap.killTweensOf(animatedElements);
      promptSplit.revert();
      addressSplit.revert();
    };
  }, []);

  function layerElement(name: "prompt" | "address" | "confirmation") {
    return { prompt: prompt.current, address: address.current, confirmation: confirmation.current }[
      name
    ];
  }

  function layerCharacters(name: "prompt" | "address" | "confirmation") {
    if (name === "prompt") return promptChars.current;
    if (name === "address") return addressChars.current;
    return confirmation.current ? [confirmation.current] : [];
  }

  function alignAddress() {
    if (!button.current || !address.current) return;

    const buttonBounds = button.current.getBoundingClientRect();
    const addressBounds = address.current.getBoundingClientRect();
    const textBounds = button.current.closest(".lede")?.getBoundingClientRect();
    const wouldOverflowLeft =
      textBounds && buttonBounds.right - addressBounds.width < textBounds.left;

    address.current.style.left = wouldOverflowLeft ? "0" : "auto";
    address.current.style.right = wouldOverflowLeft ? "auto" : "0";
  }

  function showLayer(target: "prompt" | "address" | "confirmation") {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previous = visibleLayer.current;
    if (previous === target) return;
    if (target === "address") alignAddress();

    const outgoingLayer = layerElement(previous);
    const incomingLayer = layerElement(target);
    const outgoingChars = layerCharacters(previous);
    const incomingChars = layerCharacters(target);
    if (!outgoingLayer || !incomingLayer) return;

    activeTimeline.current?.kill();
    gsap.killTweensOf([
      outgoingLayer,
      incomingLayer,
      ...promptChars.current,
      ...addressChars.current,
    ]);
    visibleLayer.current = target;

    if (target === "confirmation") {
      gsap.set([prompt.current, address.current], { autoAlpha: 0 });
      gsap.set([...promptChars.current, ...addressChars.current], {
        rotationY: 0,
        opacity: 1,
      });
      gsap.fromTo(
        confirmation.current,
        {
          autoAlpha: 0,
          rotationY: effects.flip && !reduceMotion ? -75 : 0,
          transformOrigin: "50% 50% -14px",
        },
        {
          autoAlpha: 1,
          rotationY: 0,
          duration: effects.flip && !reduceMotion ? 0.2 : 0,
          ease: "back.out(1.4)",
          overwrite: true,
        },
      );
      return;
    }

    if (!effects.flip || reduceMotion) {
      gsap.set([prompt.current, address.current, confirmation.current], { autoAlpha: 0 });
      gsap.set(incomingLayer, { autoAlpha: 1 });
      gsap.set([...promptChars.current, ...addressChars.current], {
        rotationY: 0,
        opacity: 1,
      });
      return;
    }

    const returningToPrompt = target === "prompt";
    const timeline = gsap.timeline({
      defaults: { overwrite: true },
    });
    activeTimeline.current = timeline;

    timeline
      .to(outgoingChars, {
        rotationY: 90,
        opacity: 0,
        duration: returningToPrompt ? 0.09 : 0.13,
        stagger: returningToPrompt ? 0.004 : 0.008,
        ease: "power2.in",
        transformOrigin: "50% 50% -14px",
      })
      .set(outgoingLayer, { autoAlpha: 0 })
      .set(incomingLayer, { autoAlpha: 1 })
      .fromTo(
        incomingChars,
        {
          rotationY: -90,
          opacity: 0,
          transformOrigin: "50% 50% -14px",
        },
        {
          rotationY: 0,
          opacity: 1,
          duration: returningToPrompt ? 0.17 : 0.28,
          stagger: returningToPrompt ? 0.007 : 0.012,
          ease: "back.out(1.4)",
        },
        "-=0.02",
      );
  }

  function isInteractionActive() {
    return hovered.current || keyboardFocused.current;
  }

  async function copyEmail() {
    try {
      await writeToClipboard(email);
      setCopied(true);
      showLayer("confirmation");
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => {
        setCopied(false);
        showLayer(isInteractionActive() ? "address" : "prompt");
      }, 1800);
    } catch {
      // Keep the address visible so it can still be copied manually.
      setCopied(false);
      showLayer("address");
    }
  }

  return (
    <button
      type="button"
      ref={button}
      className="copy-email"
      onClick={copyEmail}
      onPointerEnter={(event) => {
        if (event.pointerType !== "mouse") return;
        hovered.current = true;
        if (!copied) showLayer("address");
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== "mouse") return;
        hovered.current = false;
        if (!copied && !keyboardFocused.current) showLayer("prompt");
      }}
      onFocus={() => {
        keyboardFocused.current = button.current?.matches(":focus-visible") ?? false;
        if (keyboardFocused.current && !copied) showLayer("address");
      }}
      onBlur={() => {
        keyboardFocused.current = false;
        if (!copied && !hovered.current) showLayer("prompt");
      }}
      aria-label={copied ? "Email copied" : `Copy ${email}`}
    >
      <span className="copy-email-stage" aria-hidden="true">
        <span ref={prompt} className="copy-email-layer copy-email-prompt">
          <span ref={promptText} className="copy-email-text">
            please get in touch
          </span>
        </span>
        <span ref={address} className="copy-email-layer copy-email-address">
          <span ref={addressText} className="copy-email-text">
            {email}
          </span>
          <svg className="copy-email-icon" viewBox="0 0 16 16">
            <rect x="5.5" y="2.5" width="8" height="8" rx="1" />
            <path d="M10.5 12.5v1h-7a1 1 0 0 1-1-1v-7h1" />
          </svg>
        </span>
        <span ref={confirmation} className="copy-email-layer copy-email-confirmation">
          copied!
          <svg className="copy-email-icon" viewBox="0 0 16 16">
            <path d="m3 8.5 3 3 7-7" />
          </svg>
        </span>
      </span>
      <span className="visually-hidden" role="status" aria-live="polite">
        {copied ? "Email copied" : ""}
      </span>
    </button>
  );
}

export default function Home() {
  const featured = projects.slice(0, 3);
  return (
    <>
      <section className="intro">
        <div className="intro-copy">
          <h1>{site.name}</h1>
          <p className="lede">
            {site.intro} I’m always interested in feedback and conversations with curious people—
            <CopyEmail email={site.contact.email} effects={site.contactAnimation} />.
          </p>
          <p className="interests">{site.interests.join(" · ")}</p>
        </div>
        <div className="avatar-frame" style={{ "--avatar-size": site.photoSize } as CSSProperties}>
          <img
            src={site.photo}
            alt={site.name}
            className={`avatar avatar-default avatar-${site.photoShape}`}
          />
          <img
            src="profile-photo-transparent-BLUE.png"
            alt=""
            className={`avatar avatar-hover avatar-${site.photoShape}`}
          />
        </div>
      </section>

      <div className="feature-grid">
        {site.featuredAreas.map((area) => (
          <a key={area.title} href={area.url} target="_blank" rel="noreferrer" className="feature">
            <img src={area.image} alt={area.imageAlt} className="feature-image" />
            <div>
              <h2>{area.title}</h2>
              <p>{area.text}</p>
            </div>
          </a>
        ))}
      </div>

      <section className="section">
        <h2>Projects</h2>
        <div className="card-grid">
          {featured.map((p) => (
            <ProjectCard key={p.slug} project={p} />
          ))}
        </div>
        <p className="more">
          <Link to="/projects">All projects →</Link>
        </p>
      </section>

      <section className="section">
        <h2>Contact</h2>
        <ul className="contact-list">
          <li>
            <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </li>
          <li>
            <a href={site.contact.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
          </li>
          {site.contact.linkedin && (
            <li>
              <a href={site.contact.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            </li>
          )}
          <li>
            <a href={site.resumeUrl} target="_blank" rel="noreferrer">
              Resume (PDF)
            </a>
          </li>
          <li>
            <button
              type="button"
              className="cal-button"
              data-cal-link="mohnjahoney"
              data-cal-config='{"theme":"light"}'
            >
              Try Cal.com
            </button>
          </li>
        </ul>
      </section>
    </>
  );
}
