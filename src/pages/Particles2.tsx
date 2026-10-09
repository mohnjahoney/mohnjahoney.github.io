import { useEffect, useRef } from "react";

const GROUPS = 2;
const MEMBERS = 6;
const DURATION = 820;
const TAU = Math.PI * 2;

function smoothstep(value: number) {
  const u = Math.max(0, Math.min(1, value));
  return u * u * (3 - 2 * u);
}

function particlePosition(group: number, member: number, t: number) {
  const groupPhase = (TAU * group) / GROUPS;
  const memberPhase = (TAU * member) / MEMBERS;
  const oneMinusT = 1 - t;
  const variation = Math.sin(1.7 * groupPhase + 0.4);
  const burstWidth = 0.37 * (1 + 0.12 * variation);
  const burstTime = 0.15 + 0.025 * Math.cos(groupPhase);
  const collapseStart = 0.59 + 0.06 * Math.sin(groupPhase + 0.7);
  const swirlTurns = 2.2 + 0.28 * Math.cos(1.3 * groupPhase);
  const direction = Math.cos(groupPhase) >= 0 ? 1 : -1;
  const swoopAmount = 1 + 0.14 * Math.sin(groupPhase + 1.1);

  const x = 3 * oneMinusT ** 2 * t * 0.08 + 3 * oneMinusT * t ** 2 * 0.62 + t ** 3;
  const y =
    3 * oneMinusT ** 2 * t * direction * 0.27 * swoopAmount +
    3 * oneMinusT * t ** 2 * direction * 0.43 * swoopAmount;

  const grow = smoothstep(t / burstTime);
  const shrink = 1 - smoothstep((t - collapseStart) / (1 - collapseStart));
  const radius = burstWidth * grow * shrink;
  const angle = memberPhase + groupPhase + swirlTurns * Math.PI * t;

  return {
    x: x + radius * Math.cos(angle),
    y: y + radius * Math.sin(angle),
  };
}

export function TrajectoryRibbonCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let frameId = 0;
    let startTime = performance.now();
    const colors = ["#244a8f", "#b65d38"];

    function resize() {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = Math.round(bounds.width * pixelRatio);
      canvas.height = Math.round(bounds.height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function draw(now: number) {
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      const progress = ((now - startTime) % DURATION) / DURATION;

      context.clearRect(0, 0, width, height);
      context.lineCap = "round";
      context.lineJoin = "round";

      const map = (point: { x: number; y: number }) => ({
        x: 28 + point.x * (width - 56),
        y: height * 0.54 - point.y * (height * 0.72),
      });

      context.strokeStyle = "rgba(36, 74, 143, 0.12)";
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(28, height * 0.54);
      context.lineTo(width - 28, height * 0.54);
      context.stroke();

      for (let group = 0; group < GROUPS; group += 1) {
        for (let member = 0; member < MEMBERS; member += 1) {
          context.strokeStyle = colors[group];
          context.globalAlpha = 0.45;
          context.lineWidth = 1.5;
          context.beginPath();

          const trailSamples = 64;
          for (let sample = 0; sample <= trailSamples; sample += 1) {
            const trailT = (progress * sample) / trailSamples;
            const point = map(particlePosition(group, member, trailT));
            if (sample === 0) context.moveTo(point.x, point.y);
            else context.lineTo(point.x, point.y);
          }
          context.stroke();

          const current = map(particlePosition(group, member, progress));
          context.globalAlpha = 1;
          context.fillStyle = colors[group];
          context.beginPath();
          context.arc(current.x, current.y, 3.5, 0, TAU);
          context.fill();
        }
      }

      context.globalAlpha = 1;
      context.fillStyle = "#1c1c1e";
      context.font = "500 12px -apple-system, BlinkMacSystemFont, sans-serif";
      context.textAlign = "center";
      context.fillText("A", 28, height * 0.54 + 24);
      context.fillText("B", width - 28, height * 0.54 + 24);

      frameId = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);
    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-label="Animated trajectories swirling from A to B" />;
}

export default function Particles2() {
  return (
    <section className="particles-page">
      <p className="eyebrow">Trajectory study</p>
      <h1>Swirling ribbon</h1>
      <p className="particles-intro">
        Twelve points leave A in a quick, controlled burst, split into two soft swoops, and settle together at B.
      </p>
      <div className="particles-canvas-frame">
        <TrajectoryRibbonCanvas />
      </div>
    </section>
  );
}
