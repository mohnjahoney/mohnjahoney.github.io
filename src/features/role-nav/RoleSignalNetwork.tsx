import { useEffect, useMemo, useRef, useState } from "react";

const LAYER_COUNT = 7;
const DEFAULT_MIN_NODES_PER_LAYER = 1;
const DEFAULT_MAX_NODES_PER_LAYER = 4;
const MAX_NODE_COUNT = 8;
const DEFAULT_LAYER_STEP_MS = 200;
const DEFAULT_FADE_HALF_LIFE_MS = 100;
const MAX_FADE_HALF_LIFE_MS = 200;
const ACTIVE_OPACITY = 0.8;

type NetworkNode = {
  id: string;
  layer: number;
  x: number;
  y: number;
  fieldU?: number;
  fieldV?: number;
  role?: boolean;
};

type FieldCorner = {
  x: number;
  y: number;
};

type NetworkEdge = {
  from: NetworkNode;
  to: NetworkNode;
  step: number;
  sourceRole?: string;
  targetRole?: string;
};

type Signal = {
  id: number;
  source: string;
  target: string;
  startedAt: number;
};

const fallbackRolePositions: Record<string, { x: number; y: number }> = {
  physicist: { x: 40, y: 16 },
  learning: { x: 40, y: 39 },
  software: { x: 40, y: 62 },
  music: { x: 40, y: 85 },
};

const layerProgress = [0, 0.2, 0.45, 1, 0.45, 0.2, 0];
const layerVerticalCenters = [0.3, 0.2, 0.12, 0.5, 0.88, 0.8, 0.7];
const LAYER_NODE_BAND = 0.16;
const defaultFieldCorners: Record<string, FieldCorner> = {
  topLeft: { x: 44, y: 3 },
  topRight: { x: 86, y: 3 },
  bottomRight: { x: 86, y: 97 },
  bottomLeft: { x: 44, y: 97 },
};

function randomLayerNodeCount(minNodesPerLayer: number, maxNodesPerLayer: number) {
  return Math.floor(Math.random() * (maxNodesPerLayer - minNodesPerLayer + 1)) + minNodesPerLayer;
}

function createNetwork(roleIds: string[], minNodesPerLayer: number, maxNodesPerLayer: number) {
  const layers: NetworkNode[][] = [];
  const roleNodes: NetworkNode[] = roleIds.map((roleId) => ({
    id: roleId,
    layer: -1,
    x: fallbackRolePositions[roleId].x,
    y: fallbackRolePositions[roleId].y,
    role: true,
  }));
  const nodes: NetworkNode[] = [...roleNodes];

  for (let layer = 0; layer < LAYER_COUNT; layer += 1) {
    const nodeCount = randomLayerNodeCount(minNodesPerLayer, maxNodesPerLayer);
    const layerNodes = Array.from({ length: nodeCount }, (_, index) => {
      const layerCenter = layerVerticalCenters[layer];
      const offset = nodeCount === 1 ? 0 : index / (nodeCount - 1) - 0.5;
      const fieldV = Math.max(0.025, Math.min(0.975, layerCenter + offset * LAYER_NODE_BAND));
      const node = {
        id: `layer-${layer}-node-${index}`,
        layer,
        x: 0,
        y: 0,
        fieldU: layerProgress[layer],
        fieldV,
      };
      nodes.push(node);
      return node;
    });
    layers.push(layerNodes);
  }

  const edges: NetworkEdge[] = [];
  for (let layer = 0; layer < LAYER_COUNT - 1; layer += 1) {
    for (const from of layers[layer]) {
      for (const to of layers[layer + 1]) {
        edges.push({ from, to, step: layer + 1 });
      }
    }
  }

  for (const roleNode of roleNodes) {
    for (const node of layers[0]) {
      edges.push({ from: roleNode, to: node, step: 0, sourceRole: roleNode.id });
    }
    for (const node of layers[LAYER_COUNT - 1]) {
      edges.push({ from: node, to: roleNode, step: LAYER_COUNT, targetRole: roleNode.id });
    }
  }

  return { nodes, edges, firstLayer: layers[0], lastLayer: layers[LAYER_COUNT - 1] };
}

function decayFrom(timeSinceArrival: number, fadeHalfLifeMs: number) {
  if (fadeHalfLifeMs === 0) return timeSinceArrival === 0 ? ACTIVE_OPACITY : 0;
  return ACTIVE_OPACITY * 2 ** (-timeSinceArrival / fadeHalfLifeMs);
}

function nodeActivity(
  signal: Signal,
  nodeLayer: number,
  now: number,
  layerStepMs: number,
  fadeHalfLifeMs: number,
) {
  const elapsed = now - signal.startedAt;
  const arrival = (nodeLayer + 1) * layerStepMs;
  return elapsed >= arrival ? decayFrom(elapsed - arrival, fadeHalfLifeMs) : 0;
}

function roleNodeActivity(
  signal: Signal,
  roleId: string,
  now: number,
  layerStepMs: number,
  fadeHalfLifeMs: number,
) {
  const elapsed = now - signal.startedAt;
  const arrival = signal.target === roleId ? (LAYER_COUNT + 1) * layerStepMs : 0;
  if (signal.source !== roleId && signal.target !== roleId) return 0;
  return elapsed >= arrival ? decayFrom(elapsed - arrival, fadeHalfLifeMs) : 0;
}

function currentRoleNodeActivity(
  signals: Signal[],
  roleId: string,
  now: number,
  layerStepMs: number,
) {
  const incomingSignals = signals.filter((signal) => signal.target === roleId);
  if (incomingSignals.length === 0) return ACTIVE_OPACITY;

  const arrival = (LAYER_COUNT + 1) * layerStepMs;
  return incomingSignals.some((signal) => now - signal.startedAt >= arrival) ? ACTIVE_OPACITY : 0;
}

function edgeActivity(
  signal: Signal,
  edge: NetworkEdge,
  now: number,
  layerStepMs: number,
  fadeHalfLifeMs: number,
) {
  if (edge.sourceRole && edge.sourceRole !== signal.source) return 0;
  if (edge.targetRole && edge.targetRole !== signal.target) return 0;
  const elapsed = now - signal.startedAt;
  const start = edge.step * layerStepMs;
  const end = start + layerStepMs;
  if (elapsed < start) return 0;
  if (elapsed <= end) return ACTIVE_OPACITY;
  return decayFrom(elapsed - end, fadeHalfLifeMs);
}

function peakActivity(signals: Signal[], calculate: (signal: Signal) => number) {
  return signals.reduce((peak, signal) => Math.max(peak, calculate(signal)), 0);
}

export default function RoleSignalNetwork({
  activeRoleId,
  roleIds,
  measuredRolePositions,
}: {
  activeRoleId: string;
  roleIds: string[];
  measuredRolePositions: Record<string, { x: number; y: number }>;
}) {
  const [minNodesPerLayer, setMinNodesPerLayer] = useState(DEFAULT_MIN_NODES_PER_LAYER);
  const [maxNodesPerLayer, setMaxNodesPerLayer] = useState(DEFAULT_MAX_NODES_PER_LAYER);
  const [layerStepMs, setLayerStepMs] = useState(DEFAULT_LAYER_STEP_MS);
  const [fadeHalfLifeMs, setFadeHalfLifeMs] = useState(DEFAULT_FADE_HALF_LIFE_MS);
  const [fieldCorners, setFieldCorners] = useState(defaultFieldCorners);
  const [draggingCorner, setDraggingCorner] = useState<string | null>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const network = useMemo(
    () => createNetwork(roleIds, minNodesPerLayer, maxNodesPerLayer),
    [maxNodesPerLayer, minNodesPerLayer, roleIds],
  );
  const positionedNetwork = useMemo(() => {
    const positionNode = (node: NetworkNode) => {
      const measuredPosition = node.role ? measuredRolePositions[node.id] : undefined;
      if (measuredPosition) return { ...node, ...measuredPosition };
      if (node.fieldU === undefined || node.fieldV === undefined) return node;

      const topX =
        fieldCorners.topLeft.x + (fieldCorners.topRight.x - fieldCorners.topLeft.x) * node.fieldU;
      const topY =
        fieldCorners.topLeft.y + (fieldCorners.topRight.y - fieldCorners.topLeft.y) * node.fieldU;
      const bottomX =
        fieldCorners.bottomLeft.x +
        (fieldCorners.bottomRight.x - fieldCorners.bottomLeft.x) * node.fieldU;
      const bottomY =
        fieldCorners.bottomLeft.y +
        (fieldCorners.bottomRight.y - fieldCorners.bottomLeft.y) * node.fieldU;

      return {
        ...node,
        x: topX + (bottomX - topX) * node.fieldV,
        y: topY + (bottomY - topY) * node.fieldV,
      };
    };

    return {
      ...network,
      nodes: network.nodes.map(positionNode),
      edges: network.edges.map((edge) => ({
        ...edge,
        from: positionNode(edge.from),
        to: positionNode(edge.to),
      })),
    };
  }, [fieldCorners, measuredRolePositions, network]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const previousRoleRef = useRef(activeRoleId);
  const nextSignalIdRef = useRef(0);

  useEffect(() => {
    const source = previousRoleRef.current;
    previousRoleRef.current = activeRoleId;
    if (source === activeRoleId) return;

    setSignals((currentSignals) => [
      ...currentSignals,
      {
        id: nextSignalIdRef.current++,
        source,
        target: activeRoleId,
        startedAt: performance.now(),
      },
    ]);
  }, [activeRoleId]);

  const [now, setNow] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = (timestamp: number) => {
      setNow(timestamp);
      setSignals((currentSignals) => {
        const maxLifetime = (LAYER_COUNT + 1) * layerStepMs + Math.max(fadeHalfLifeMs, 1) * 8;
        const remaining = currentSignals.filter(
          (signal) => timestamp - signal.startedAt < maxLifetime,
        );
        return remaining.length === currentSignals.length ? currentSignals : remaining;
      });
      frame = window.requestAnimationFrame(update);
    };
    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [fadeHalfLifeMs, layerStepMs]);

  useEffect(() => {
    if (!draggingCorner) return undefined;

    const moveCorner = (event: PointerEvent) => {
      const graph = graphRef.current;
      if (!graph) return;
      const bounds = graph.getBoundingClientRect();
      const x = Math.max(0, Math.min(100, ((event.clientX - bounds.left) / bounds.width) * 100));
      const y = Math.max(0, Math.min(100, ((event.clientY - bounds.top) / bounds.height) * 100));
      setFieldCorners((current) => ({
        ...current,
        [draggingCorner]: { x, y },
      }));
    };
    const stopMovingCorner = () => setDraggingCorner(null);

    window.addEventListener("pointermove", moveCorner);
    window.addEventListener("pointerup", stopMovingCorner);
    return () => {
      window.removeEventListener("pointermove", moveCorner);
      window.removeEventListener("pointerup", stopMovingCorner);
    };
  }, [draggingCorner]);

  const renderEdge = (edge: NetworkEdge, key: string) => {
    const activity = peakActivity(signals, (signal) =>
      edgeActivity(signal, edge, now, layerStepMs, fadeHalfLifeMs),
    );
    return (
      <line
        key={key}
        x1={edge.from.x}
        y1={edge.from.y}
        x2={edge.to.x}
        y2={edge.to.y}
        className={activity > 0 ? "active" : ""}
        style={{ opacity: activity > 0 ? activity : 0 }}
      />
    );
  };

  return (
    <>
      <div ref={graphRef} className="role-nav-graph role-signal-network" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none">
          {positionedNetwork.edges.map((edge, index) => renderEdge(edge, `network-edge-${index}`))}
        </svg>
        {positionedNetwork.nodes.map((node) => {
          const activity = node.role
            ? node.id === activeRoleId
              ? currentRoleNodeActivity(signals, node.id, now, layerStepMs)
              : peakActivity(signals, (signal) =>
                  roleNodeActivity(signal, node.id, now, layerStepMs, fadeHalfLifeMs),
                )
            : peakActivity(signals, (signal) =>
                nodeActivity(signal, node.layer, now, layerStepMs, fadeHalfLifeMs),
              );
          return (
            <span
              key={node.id}
              className={`role-signal-node${node.role ? " role-signal-role-node" : ""}`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                opacity: activity > 0 ? activity : 0,
                backgroundColor: activity > 0 ? "var(--role-accent)" : "transparent",
              }}
            />
          );
        })}
      </div>
      <div className="role-nav-field-controls" aria-label="Node placement field">
        {Object.entries(fieldCorners).map(([corner, position]) => (
          <button
            key={corner}
            type="button"
            className="role-nav-field-handle"
            style={{ left: `${position.x}%`, top: `${position.y}%` }}
            onPointerDown={(event) => {
              event.preventDefault();
              setDraggingCorner(corner);
            }}
            aria-label={`Move ${corner} node placement corner`}
          />
        ))}
      </div>
      <div className="role-nav-network-controls" aria-label="Network controls">
        <div className="role-nav-network-control">
          <span>min nodes</span>
          <button
            type="button"
            onClick={() => setMinNodesPerLayer((value) => Math.max(1, value - 1))}
            disabled={minNodesPerLayer <= 1}
            aria-label="Decrease minimum nodes per layer"
          >
            −
          </button>
          <output>{minNodesPerLayer}</output>
          <button
            type="button"
            onClick={() => setMinNodesPerLayer((value) => Math.min(maxNodesPerLayer, value + 1))}
            disabled={minNodesPerLayer >= maxNodesPerLayer}
            aria-label="Increase minimum nodes per layer"
          >
            +
          </button>
        </div>
        <div className="role-nav-network-control">
          <span>max nodes</span>
          <button
            type="button"
            onClick={() => setMaxNodesPerLayer((value) => Math.max(minNodesPerLayer, value - 1))}
            disabled={maxNodesPerLayer <= minNodesPerLayer}
            aria-label="Decrease maximum nodes per layer"
          >
            −
          </button>
          <output>{maxNodesPerLayer}</output>
          <button
            type="button"
            onClick={() => setMaxNodesPerLayer((value) => Math.min(MAX_NODE_COUNT, value + 1))}
            disabled={maxNodesPerLayer >= MAX_NODE_COUNT}
            aria-label="Increase maximum nodes per layer"
          >
            +
          </button>
        </div>
        <label className="role-nav-network-time-control">
          <span>signal time per layer: {String(layerStepMs).padStart(3, "0")}ms</span>
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={layerStepMs}
            onChange={(event) => setLayerStepMs(Number(event.target.value))}
          />
        </label>
        <label className="role-nav-network-time-control">
          <span>fade-out half-life: {String(fadeHalfLifeMs).padStart(3, "0")}ms</span>
          <input
            type="range"
            min="0"
            max={MAX_FADE_HALF_LIFE_MS}
            step="10"
            value={fadeHalfLifeMs}
            onChange={(event) => setFadeHalfLifeMs(Number(event.target.value))}
          />
        </label>
      </div>
    </>
  );
}
