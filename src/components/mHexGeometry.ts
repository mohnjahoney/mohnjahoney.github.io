export type Point = Readonly<{ x: number; y: number }>;

// This describes the finished edge of the letter—not an SVG stroke.
// Adjust this value to make every visible M segment thicker or thinner.
const M_THICKNESS = 30;
const HEX_CENTER = 64;
const HEX_RADIUS = 60;
const HEX_VERTICAL_OFFSET = (HEX_RADIUS * Math.sqrt(3)) / 2;
const HEX_TOP = HEX_CENTER - HEX_VERTICAL_OFFSET;
const HEX_BOTTOM = HEX_CENTER + HEX_VERTICAL_OFFSET;
const HEX_LEFT_TOP = HEX_CENTER - HEX_RADIUS / 2;
const HEX_RIGHT_TOP = HEX_CENTER + HEX_RADIUS / 2;

const HEXAGON: readonly Point[] = [
  { x: HEX_LEFT_TOP, y: HEX_TOP },
  { x: HEX_RIGHT_TOP, y: HEX_TOP },
  { x: HEX_CENTER + HEX_RADIUS, y: HEX_CENTER },
  { x: HEX_RIGHT_TOP, y: HEX_BOTTOM },
  { x: HEX_LEFT_TOP, y: HEX_BOTTOM },
  { x: HEX_CENTER - HEX_RADIUS, y: HEX_CENTER },
];

const subtract = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const scale = (point: Point, amount: number): Point => ({
  x: point.x * amount,
  y: point.y * amount,
});
const cross = (a: Point, b: Point): number => a.x * b.y - a.y * b.x;

const normalize = (point: Point): Point => {
  const length = Math.hypot(point.x, point.y);
  return { x: point.x / length, y: point.y / length };
};

const leftNormal = (direction: Point): Point => ({ x: -direction.y, y: direction.x });

const lineIntersection = (startA: Point, endA: Point, startB: Point, endB: Point): Point => {
  const directionA = subtract(endA, startA);
  const directionB = subtract(endB, startB);
  const divisor = cross(directionA, directionB);

  if (Math.abs(divisor) < 0.00001) return startA;

  const distance = cross(subtract(startB, startA), directionB) / divisor;
  return add(startA, scale(directionA, distance));
};

const offsetContour = (points: readonly Point[], offsets: readonly number[]): Point[] =>
  points.map((point, index) => {
    if (index === 0) {
      const normal = leftNormal(normalize(subtract(points[1], point)));
      return add(point, scale(normal, offsets[0]));
    }

    if (index === points.length - 1) {
      const normal = leftNormal(normalize(subtract(point, points[index - 1])));
      return add(point, scale(normal, offsets[offsets.length - 1]));
    }

    const previousDirection = normalize(subtract(point, points[index - 1]));
    const nextDirection = normalize(subtract(points[index + 1], point));
    const previousNormal = leftNormal(previousDirection);
    const nextNormal = leftNormal(nextDirection);
    const previousOffset = offsets[index - 1];
    const nextOffset = offsets[index];

    return lineIntersection(
      add(point, scale(previousNormal, previousOffset)),
      add(point, add(previousDirection, scale(previousNormal, previousOffset))),
      add(point, scale(nextNormal, nextOffset)),
      add(point, add(nextDirection, scale(nextNormal, nextOffset))),
    );
  });

const isInside = (point: Point, edgeStart: Point, edgeEnd: Point): boolean =>
  cross(subtract(edgeEnd, edgeStart), subtract(point, edgeStart)) >= -0.00001;

const clipToEdge = (points: readonly Point[], edgeStart: Point, edgeEnd: Point): Point[] => {
  if (points.length === 0) return [];

  return points.reduce<Point[]>((clipped, end, index) => {
    const start = points[(index + points.length - 1) % points.length];
    const startInside = isInside(start, edgeStart, edgeEnd);
    const endInside = isInside(end, edgeStart, edgeEnd);

    if (startInside !== endInside) {
      clipped.push(lineIntersection(start, end, edgeStart, edgeEnd));
    }
    if (endInside) clipped.push(end);

    return clipped;
  }, []);
};

/**
 * Produces the ordered perimeter points of the M as a filled polygon.
 * The outer segments are one-sided, anchored exactly to the hexagon boundary;
 * the two interior diagonals are centered. Both therefore have the same visible width.
 */
export const createMOutlinePoints = (thickness = M_THICKNESS): Point[] => {
  const spine: readonly Point[] = [
    { x: HEX_LEFT_TOP, y: HEX_BOTTOM },
    { x: HEX_CENTER - HEX_RADIUS, y: HEX_CENTER },
    { x: HEX_LEFT_TOP, y: HEX_TOP },
    { x: HEX_CENTER, y: HEX_CENTER },
    { x: HEX_RIGHT_TOP, y: HEX_TOP },
    { x: HEX_CENTER + HEX_RADIUS, y: HEX_CENTER },
    { x: HEX_RIGHT_TOP, y: HEX_BOTTOM },
  ];

  const halfThickness = thickness / 2;
  const leftEdge = offsetContour(spine, [
    thickness,
    thickness,
    halfThickness,
    halfThickness,
    thickness,
    thickness,
  ]);
  const rightEdge = offsetContour(spine, [0, 0, -halfThickness, -halfThickness, 0, 0]).reverse();

  return HEXAGON.reduce(
    (outline, edgeStart, index) =>
      clipToEdge(outline, edgeStart, HEXAGON[(index + 1) % HEXAGON.length]),
    [...leftEdge, ...rightEdge],
  );
};

export const pointsToPath = (points: readonly Point[]): string =>
  points.map(({ x, y }, index) => `${index === 0 ? "M" : "L"}${x} ${y}`).join(" ") + " Z";

export const createHexagonPath = (): string => pointsToPath(HEXAGON);
