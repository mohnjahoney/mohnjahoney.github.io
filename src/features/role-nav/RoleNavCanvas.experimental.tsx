// EXPERIMENTAL / INACTIVE
//
// This is the previous role-nav particle field, preserved for reference and
// possible reuse. The active role-nav background is now TrajectoryRibbonCanvas
// from src/pages/Particles2.tsx.

// EXPERIMENTAL / INACTIVE ARCHIVE
// Original role-nav particle path implementation, preserved while the newer
// ribbon trajectory is tested in RoleNavCanvas.tsx.

import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import { gsap } from "gsap/gsap-core";

type RoleNavCanvasProps = {
  activeRoleId: string;
  roleAnchorRefs: RefObject<Record<string, HTMLElement | null>>;
  previewAnchorRef: RefObject<HTMLElement | null>;
  onPreviewImpact: () => void;
};

type Particle = {
  x: number;
  y: number;
  path: PathDefinition;
  durationMs: number;
  isLongestPath: boolean;
  ageMs: number;
  impactReported: boolean;
};

type FieldPoint = {
  x: number;
  y: number;
};

type PathDefinition = {
  points: FieldPoint[];
  length: number;
};

type GridMetrics = {
  width: number;
  height: number;
  radius: number;
  cellWidth: number;
  rowHeight: number;
  firstColumnX: number;
  firstRowY: number;
};

const GRID_COLUMNS = 30;
const GRID_ROWS = 20;
const PARTICLE_RADIUS = 3;
const DEFAULT_PARTICLE_COUNT = 20;
const SUBPARTICLE_COUNT = 20;
const SUBPARTICLE_DELAY_MS = 10;
const BURST_RADIUS_PX = 300;
const ORBIT_ANGLE = 3 * Math.PI;
const BURST_END_TIME = 0.35;
const FLOAT_END_TIME = 0.5;
const ORBIT_START_TIME = 0.45;
const ORBIT_END_TIME = 0.9;
const CONTRACT_START_TIME = 0.82;
const SUBPARTICLE_ANGLE_SPREAD = 0.015;
const SUBPARTICLE_RADIUS_SPREAD = 0.04;
const PATH_POINT_COUNT = 200;
const DEFAULT_PATH_DURATION_MS = 2000;
const HEX_FADE_HALF_LIFE_MS = 200;
const MIN_HEX_ACTIVATION_DISTANCE_PX = 2;
const HEX_ACTIVATION_SAMPLE_SPACING_PX = 4;
const PARTICLE_COLOR = "#ff4b4b";
const LONGEST_PARTICLE_COLOR = "#48ff70";
const LONGEST_PARTICLE_CORE_COLOR = "#c0ffcb";

const CENTER_EASING = gsap.parseEase("back.inOut(0.1)");
const BURST_EASING = gsap.parseEase("quint.out");
const ORBIT_EASING = gsap.parseEase("circ.inOut");
const CONTRACT_EASING = gsap.parseEase("quint.in");
const MAX_PARTICLE_LIFETIME_MS = 15_000;

function getGridMetrics(canvas: HTMLCanvasElement): GridMetrics | null {
  const bounds = canvas.getBoundingClientRect();
  if (bounds.width === 0 || bounds.height === 0) return null;

  const radius = Math.max(
    bounds.width / (Math.sqrt(3) * (GRID_COLUMNS + 1)),
    bounds.height / (1.5 * (GRID_ROWS + 1)),
  );
  const cellWidth = Math.sqrt(3) * radius;
  const rowHeight = radius * 1.5;

  return {
    width: bounds.width,
    height: bounds.height,
    radius,
    cellWidth,
    rowHeight,
    firstColumnX: bounds.width / 2 - ((GRID_COLUMNS - 1) * cellWidth) / 2,
    firstRowY: bounds.height / 2 - ((GRID_ROWS - 1) * rowHeight) / 2,
  };
}

function resizeCanvas(canvas: HTMLCanvasElement): GridMetrics | null {
  const metrics = getGridMetrics(canvas);
  if (!metrics) return null;

  const devicePixelRatio = window.devicePixelRatio || 1;
  const pixelWidth = Math.round(metrics.width * devicePixelRatio);
  const pixelHeight = Math.round(metrics.height * devicePixelRatio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  canvas.getContext("2d")?.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  return metrics;
}

function drawHexGrid(
  context: CanvasRenderingContext2D,
  metrics: GridMetrics,
  lineColor: string,
  accentColor: string,
  activeCells: Map<string, number>,
  timestamp: number,
) {
  context.strokeStyle = lineColor;
  context.lineWidth = 1;

  for (let row = -1; row <= GRID_ROWS; row += 1) {
    for (let column = -1; column <= GRID_COLUMNS; column += 1) {
      const centerX =
        metrics.firstColumnX +
        column * metrics.cellWidth +
        (row % 2 === 0 ? 0 : metrics.cellWidth / 2);
      const centerY = metrics.firstRowY + row * metrics.rowHeight;
      context.beginPath();
      for (let side = 0; side < 6; side += 1) {
        const angle = (Math.PI / 3) * side + Math.PI / 6;
        const x = centerX + metrics.radius * Math.cos(angle);
        const y = centerY + metrics.radius * Math.sin(angle);
        if (side === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();

      let borderColor = lineColor;
      let borderOpacity = 1;
      const activatedAt = activeCells.get(`${row}:${column}`);
      if (activatedAt !== undefined) {
        const age = timestamp - activatedAt;
        const opacity = 0.7 * 2 ** (-age / HEX_FADE_HALF_LIFE_MS);
        if (opacity > 0.01) {
          borderColor = accentColor;
          borderOpacity = opacity;
        }
      }
      context.strokeStyle = borderColor;
      context.globalAlpha = borderOpacity;
      context.stroke();
      context.globalAlpha = 1;
    }
  }
}

function activateCellAt(
  x: number,
  y: number,
  metrics: GridMetrics,
  activeCells: Map<string, number>,
  timestamp: number,
) {
  for (let row = -1; row <= GRID_ROWS; row += 1) {
    for (let column = -1; column <= GRID_COLUMNS; column += 1) {
      const centerX =
        metrics.firstColumnX +
        column * metrics.cellWidth +
        (row % 2 === 0 ? 0 : metrics.cellWidth / 2);
      const centerY = metrics.firstRowY + row * metrics.rowHeight;
      if (Math.hypot(x - centerX, y - centerY) <= metrics.radius) {
        activeCells.set(`${row}:${column}`, timestamp);
        return;
      }
    }
  }
}

function clipSegmentToCanvas(start: FieldPoint, end: FieldPoint, width: number, height: number) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  let startProgress = 0;
  let endProgress = 1;

  const updateInterval = (p: number, q: number) => {
    if (p === 0) return q >= 0;

    const ratio = q / p;
    if (p < 0) {
      if (ratio > endProgress) return false;
      if (ratio > startProgress) startProgress = ratio;
    } else {
      if (ratio < startProgress) return false;
      if (ratio < endProgress) endProgress = ratio;
    }
    return true;
  };

  if (
    !updateInterval(-dx, start.x) ||
    !updateInterval(dx, width - start.x) ||
    !updateInterval(-dy, start.y) ||
    !updateInterval(dy, height - start.y)
  ) {
    return null;
  }

  return { startProgress, endProgress };
}

function phaseProgress(time: number, start: number, end: number) {
  if (time <= start) return 0;
  if (time >= end) return 1;
  return (time - start) / (end - start);
}

function buildParticlePath(
  start: FieldPoint,
  target: FieldPoint,
  initialAngle: number,
  subparticleIndex: number,
  durationMs: number,
) {
  const distance = Math.hypot(target.x - start.x, target.y - start.y);
  const forward = {
    x: (target.x - start.x) / distance,
    y: (target.y - start.y) / distance,
  };
  const perpendicular = { x: -forward.y, y: forward.x };

  const delayMs = subparticleIndex * SUBPARTICLE_DELAY_MS;
  const maxTime = 1 + delayMs / durationMs;
  const centeredIndex = subparticleIndex - (SUBPARTICLE_COUNT - 1) / 2;
  const points = Array.from({ length: PATH_POINT_COUNT }, (_, index) => {
    const time = (index / (PATH_POINT_COUNT - 1)) * maxTime;
    const centerProgress = CENTER_EASING(Math.min(time, 1));
    const center = {
      x: start.x + (target.x - start.x) * centerProgress,
      y: start.y + (target.y - start.y) * centerProgress,
    };
    const burstProgress = BURST_EASING(phaseProgress(time, 0, BURST_END_TIME));
    const separationProgress = phaseProgress(time, BURST_END_TIME, FLOAT_END_TIME);
    const delayedTime = time - delayMs / durationMs;
    const orbitProgress = ORBIT_EASING(
      phaseProgress(delayedTime, ORBIT_START_TIME, ORBIT_END_TIME),
    );
    const contractProgress = CONTRACT_EASING(phaseProgress(delayedTime, CONTRACT_START_TIME, 1));
    const radius =
      BURST_RADIUS_PX *
      burstProgress *
      (1 + centeredIndex * SUBPARTICLE_RADIUS_SPREAD * separationProgress) *
      (1 - contractProgress);
    const angle =
      initialAngle +
      centeredIndex * SUBPARTICLE_ANGLE_SPREAD * separationProgress +
      ORBIT_ANGLE * orbitProgress;
    const localX = radius * Math.cos(angle);
    const localY = radius * Math.sin(angle);

    return {
      x: center.x + forward.x * localX + perpendicular.x * localY,
      y: center.y + forward.y * localX + perpendicular.y * localY,
    };
  });

  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(
      points[index].x - points[index - 1].x,
      points[index].y - points[index - 1].y,
    );
  }

  return { points, length };
}

function buildBurstPaths(
  start: FieldPoint,
  target: FieldPoint,
  particleCount: number,
  durationMs: number,
) {
  return Array.from({ length: particleCount }, (_, index) => {
    const initialAngle = (2 * Math.PI * index) / particleCount;
    return Array.from({ length: SUBPARTICLE_COUNT }, (_, subparticleIndex) =>
      buildParticlePath(start, target, initialAngle, subparticleIndex, durationMs),
    );
  }).flat();
}

function samplePath(path: PathDefinition, progress: number): FieldPoint {
  const scaledIndex = Math.min(1, Math.max(0, progress)) * (path.points.length - 1);
  const lowerIndex = Math.floor(scaledIndex);
  const upperIndex = Math.min(path.points.length - 1, lowerIndex + 1);
  const segmentProgress = scaledIndex - lowerIndex;
  return {
    x:
      path.points[lowerIndex].x +
      (path.points[upperIndex].x - path.points[lowerIndex].x) * segmentProgress,
    y:
      path.points[lowerIndex].y +
      (path.points[upperIndex].y - path.points[lowerIndex].y) * segmentProgress,
  };
}

function isInsideRect(point: FieldPoint, rect: DOMRect) {
  return (
    point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom
  );
}

export default function RoleNavCanvas({
  activeRoleId,
  roleAnchorRefs,
  previewAnchorRef,
  onPreviewImpact,
}: RoleNavCanvasProps) {
  const [particleCount, setParticleCount] = useState(DEFAULT_PARTICLE_COUNT);
  const [pathDurationMs, setPathDurationMs] = useState(DEFAULT_PATH_DURATION_MS);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metricsRef = useRef<GridMetrics | null>(null);
  const anchorRectsRef = useRef<Record<string, DOMRect>>({});
  const previewRectRef = useRef<DOMRect | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const activeCellsRef = useRef<Map<string, number>>(new Map());
  const previousTimeRef = useRef<number | null>(null);
  const hasMountedRef = useRef(false);
  const activeRoleRef = useRef(activeRoleId);
  const particleCountRef = useRef(particleCount);
  const pathDurationMsRef = useRef(pathDurationMs);
  activeRoleRef.current = activeRoleId;
  particleCountRef.current = particleCount;
  pathDurationMsRef.current = pathDurationMs;

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const measureAndResize = () => {
      Object.entries(roleAnchorRefs.current).forEach(([id, element]) => {
        if (element) anchorRectsRef.current[id] = element.getBoundingClientRect();
      });
      previewRectRef.current = previewAnchorRef.current?.getBoundingClientRect() ?? null;
      metricsRef.current = resizeCanvas(canvas);
    };

    measureAndResize();
    const resizeObserver = new ResizeObserver(measureAndResize);
    resizeObserver.observe(canvas);
    Object.values(roleAnchorRefs.current).forEach((element) => {
      if (element) resizeObserver.observe(element);
    });
    if (previewAnchorRef.current) resizeObserver.observe(previewAnchorRef.current);
    window.addEventListener("resize", measureAndResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measureAndResize);
    };
  }, [previewAnchorRef, roleAnchorRefs]);

  useEffect(() => {
    const roleAnchor = roleAnchorRefs.current[activeRoleId];
    if (!roleAnchor) return;

    const bounds = roleAnchor.getBoundingClientRect();
    if (hasMountedRef.current) {
      const startX = bounds.left + bounds.width / 2;
      const startY = bounds.top + bounds.height / 2;
      const previewBounds = previewRectRef.current;
      const target = previewBounds
        ? {
            x: previewBounds.left + previewBounds.width / 2,
            y: previewBounds.top + previewBounds.height / 2,
          }
        : { x: window.innerWidth * 0.75, y: window.innerHeight / 2 };
      const paths = buildBurstPaths(
        { x: startX, y: startY },
        target,
        particleCountRef.current,
        pathDurationMsRef.current,
      );
      const longestPathLength = Math.max(...paths.map((path) => path.length));
      particlesRef.current.push(
        ...paths.map((path, index) => ({
          x: startX,
          y: startY,
          path,
          durationMs:
            pathDurationMsRef.current + (index % SUBPARTICLE_COUNT) * SUBPARTICLE_DELAY_MS,
          isLongestPath: path.length === longestPathLength,
          ageMs: 0,
          impactReported: false,
        })),
      );
    } else {
      hasMountedRef.current = true;
    }
  }, [activeRoleId, roleAnchorRefs]);

  useEffect(() => {
    let frame = 0;

    const render = (timestamp: number) => {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      const metrics = metricsRef.current;
      if (!canvas || !context || !metrics) {
        frame = window.requestAnimationFrame(render);
        return;
      }

      const previousTime = previousTimeRef.current ?? timestamp;
      const elapsedSeconds = Math.min((timestamp - previousTime) / 1000, 0.1);
      previousTimeRef.current = timestamp;

      const lineColor =
        getComputedStyle(canvas).getPropertyValue("--role-canvas-line").trim() ||
        "rgba(255, 255, 255, 0.05)";
      const accentColor =
        getComputedStyle(canvas).getPropertyValue("--role-accent").trim() || "#66c7ee";
      const previewBounds = previewRectRef.current;
      particlesRef.current.forEach((particle) => {
        const previousPosition = { x: particle.x, y: particle.y };
        particle.ageMs += elapsedSeconds * 1000;
        const time = Math.min(1, particle.ageMs / particle.durationMs);
        const position = samplePath(particle.path, time);
        particle.x = position.x;
        particle.y = position.y;
        const visibleSegment = clipSegmentToCanvas(
          previousPosition,
          particle,
          metrics.width,
          metrics.height,
        );
        if (visibleSegment) {
          const visibleStart = {
            x:
              previousPosition.x + (particle.x - previousPosition.x) * visibleSegment.startProgress,
            y:
              previousPosition.y + (particle.y - previousPosition.y) * visibleSegment.startProgress,
          };
          const visibleEnd = {
            x: previousPosition.x + (particle.x - previousPosition.x) * visibleSegment.endProgress,
            y: previousPosition.y + (particle.y - previousPosition.y) * visibleSegment.endProgress,
          };
          const visibleDistance = Math.hypot(
            visibleEnd.x - visibleStart.x,
            visibleEnd.y - visibleStart.y,
          );
          const sampleCount =
            visibleDistance < MIN_HEX_ACTIVATION_DISTANCE_PX
              ? 1
              : Math.ceil(visibleDistance / HEX_ACTIVATION_SAMPLE_SPACING_PX);
          for (let sample = 0; sample <= sampleCount; sample += 1) {
            const sampleProgress = sample / sampleCount;
            const sampleX = visibleStart.x + (visibleEnd.x - visibleStart.x) * sampleProgress;
            const sampleY = visibleStart.y + (visibleEnd.y - visibleStart.y) * sampleProgress;
            // The clipped segment guarantees that these points are on-screen.
            activateCellAt(sampleX, sampleY, metrics, activeCellsRef.current, timestamp);
          }
        }
        if (previewBounds && isInsideRect(particle, previewBounds) && !particle.impactReported) {
          particle.impactReported = true;
          onPreviewImpact();
        }
      });

      activeCellsRef.current.forEach((activatedAt, key) => {
        if (timestamp - activatedAt > HEX_FADE_HALF_LIFE_MS * 8) {
          activeCellsRef.current.delete(key);
        }
      });

      context.clearRect(0, 0, metrics.width, metrics.height);
      drawHexGrid(context, metrics, lineColor, accentColor, activeCellsRef.current, timestamp);

      const activeRoleBounds = anchorRectsRef.current[activeRoleRef.current];
      if (activeRoleBounds) {
        context.beginPath();
        context.arc(
          activeRoleBounds.left + activeRoleBounds.width / 2,
          activeRoleBounds.top + activeRoleBounds.height / 2,
          8,
          0,
          Math.PI * 2,
        );
        context.fillStyle = accentColor;
        context.globalAlpha = 0.8;
        context.fill();
      }
      context.globalAlpha = 1;

      context.fillStyle = PARTICLE_COLOR;
      context.shadowColor = PARTICLE_COLOR;
      context.shadowBlur = 10;
      context.globalCompositeOperation = "source-over";
      particlesRef.current.forEach((particle) => {
        const particleColor = particle.isLongestPath ? LONGEST_PARTICLE_COLOR : PARTICLE_COLOR;
        const particleCoreColor = particle.isLongestPath ? LONGEST_PARTICLE_CORE_COLOR : "#ffb0b0";
        context.fillStyle = particleColor;
        context.shadowColor = particleColor;
        context.beginPath();
        context.arc(particle.x, particle.y, PARTICLE_RADIUS, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.fillStyle = particleCoreColor;
        context.arc(particle.x, particle.y, PARTICLE_RADIUS * 0.45, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;

      particlesRef.current = particlesRef.current.filter(
        (particle) => !particle.impactReported && particle.ageMs < MAX_PARTICLE_LIFETIME_MS,
      );

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [onPreviewImpact]);

  return (
    <>
      <canvas ref={canvasRef} className="role-nav-canvas" aria-hidden="true" />
      <div className="role-nav-physics-controls" aria-label="Particle path controls">
        <label>
          <span>
            groups: {particleCount} ({particleCount * SUBPARTICLE_COUNT} particles)
          </span>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={particleCount}
            onChange={(event) => setParticleCount(Number(event.target.value))}
            aria-label="Particle count"
          />
        </label>
        <label>
          <span>travel time: {pathDurationMs}ms</span>
          <input
            type="range"
            min="10"
            max="2000"
            step="10"
            value={pathDurationMs}
            onChange={(event) => setPathDurationMs(Number(event.target.value))}
            aria-label="Particle travel time"
          />
        </label>
      </div>
    </>
  );
}
