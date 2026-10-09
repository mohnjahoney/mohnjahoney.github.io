// Hand-drawn Bezier trajectories drive the role transition and the temporary
// hex-grid illumination behind it.

import { useCallback, useEffect, useLayoutEffect, useRef, type RefObject } from "react";

type RoleNavCanvasProps = {
  activeRoleId: string;
  roleAnchorRefs: RefObject<Record<string, HTMLElement | null>>;
  previewAnchorRef: RefObject<HTMLElement | null>;
  onNucleusImpact: (energy: number) => void;
  onSelfNucleusImpact: () => void;
  idleEnabled: boolean;
};

type Particle = {
  x: number;
  y: number;
  path: PathDefinition;
  durationMs: number;
  mark: number;
  impactEnergy: number;
  ageMs: number;
  impactReported: boolean;
  source: "transition" | "idle";
  status: "current" | "stale";
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

const GRID_COLUMNS = 20;
const GRID_ROWS = 15;
const PARTICLE_RADIUS = 3;
const HAND_DRAWN_PATH_POINT_COUNT = 360;
const PARTICLE_TIMING_SCALE = 0.8;
const HAND_DRAWN_PATH_DURATION_MS = 920 * PARTICLE_TIMING_SCALE;
const IDLE_PARTICLE_DURATION_MS = 1150;
const IDLE_LAUNCH_MIN_DELAY_MS = 3000;
const IDLE_LAUNCH_MAX_DELAY_MS = 5000;
const AMBIENT_RIPPLE_MIN_DELAY_MS = 8000;
const AMBIENT_RIPPLE_MAX_DELAY_MS = 14000;
const AMBIENT_RIPPLE_DURATION_MS = 6500;
const AMBIENT_RIPPLE_BASE_OPACITY_SCALE = 0.42;
const AMBIENT_RIPPLE_PEAK_OPACITY = 0.16;
// Let the first particle establish the gesture, then tighten the follow-on hits.
const PARTICLE_LAUNCH_TIMES_MS = [0, 204, 294, 385];
const HEX_FADE_HALF_LIFE_MS = 200 * PARTICLE_TIMING_SCALE;
const MIN_HEX_ACTIVATION_DISTANCE_PX = 2;
const HEX_ACTIVATION_SAMPLE_SPACING_PX = 4;
const PARTICLE_COLOR = "#ff4b4b";
const HAND_DRAWN_COLORS: Record<number, string> = {
  1: "#f29fc0",
  3: "#a7df72",
  4: "#f2b84b",
  6: "#68b7ff",
  7: "#d98cff",
  8: "#71dfb2",
  9: "#ff8f72",
};

type BezierSegment = [[number, number], [number, number], [number, number], [number, number]];

const HAND_DRAWN_MARKS: Record<number, BezierSegment[]> = {
  1: [
    [[454.19, 338.28], [448.41, 309.35], [416.76, 238.98], [369.07, 194.48]],
    [[369.07, 194.48], [338.00, 165.50], [226.92, 89.52], [184.37, 159.73]],
    [[184.37, 159.73], [160.81, 198.61], [174.03, 261.42], [218.48, 305.88]],
    [[218.48, 305.88], [228.57, 315.97], [362.34, 393.06], [386.66, 421.75]],
    [[386.66, 421.75], [426.80, 469.09], [429.30, 543.11], [338.49, 544.08]],
    [[338.49, 544.08], [273.93, 544.76], [158.32, 521.97], [158.32, 404.19]],
    [[158.32, 404.19], [158.32, 379.82], [157.50, 368.03], [184.19, 345.66]],
    [[184.19, 345.66], [269.90, 273.82], [575.65, 122.07], [708.73, 143.24]],
    [[708.73, 143.24], [793.83, 156.78], [911.21, 202.75], [953.41, 329.36]],
    [[953.41, 329.36], [965.75, 366.38], [971.57, 504.38], [902.12, 533.32]],
    [[902.12, 533.32], [832.73, 562.23], [629.32, 514.31], [592.20, 404.19]],
    [[592.20, 404.19], [579.74, 367.21], [592.87, 266.89], [642.62, 239.11]],
    [[642.62, 239.11], [734.35, 187.87], [887.24, 297.78], [836.99, 394.01]],
    [[836.99, 394.01], [809.56, 446.54], [727.59, 413.72], [708.73, 338.28]],
  ],
  3: [
    [[325.27, 314.31], [357.50, 311.83], [537.66, 97.79], [417.69, 67.47]],
    [[417.69, 67.47], [387.25, 59.77], [150.89, 8.53], [133.60, 73.10]],
    [[133.60, 73.10], [126.10, 101.09], [56.68, 535.80], [178.00, 529.79]],
    [[178.00, 529.79], [223.62, 527.53], [252.54, 549.02], [275.14, 541.83]],
    [[275.14, 541.83], [361.63, 514.31], [216.18, 111.01], [350.94, 108.49]],
    [[350.94, 108.49], [393.03, 107.71], [526.92, 92.83], [529.25, 168.31]],
    [[529.25, 168.31], [531.87, 253.16], [369.89, 504.39], [481.29, 531.70]],
    [[481.29, 531.70], [538.49, 545.71], [688.07, 621.75], [682.49, 526.84]],
    [[682.49, 526.84], [676.50, 425.06], [491.38, 115.14], [600.34, 101.94]],
    [[600.34, 101.94], [655.01, 95.31], [772.37, 39.11], [801.50, 74.07]],
    [[801.50, 74.07], [855.01, 138.28], [635.18, 539.10], [770.95, 561.32]],
    [[770.95, 561.32], [816.99, 568.85], [894.68, 598.61], [908.31, 525.22]],
    [[908.31, 525.22], [916.17, 482.91], [932.69, 244.89], [870.23, 206.97]],
    [[870.23, 206.97], [840.13, 188.70], [715.34, 170.51], [711.11, 271.04]],
    [[711.11, 271.04], [708.73, 327.54], [686.42, 328.17], [700.47, 320.00]],
  ],
  4: [
    [[92.21, 294.48], [114.53, 294.48], [307.09, 289.52], [461.21, 250.65]],
    [[461.21, 250.65], [497.16, 241.59], [656.67, 201.92], [630.64, 115.16]],
    [[630.64, 115.16], [607.08, 36.63], [464.93, 30.85], [391.53, 88.80]],
    [[391.53, 88.80], [339.32, 130.02], [318.66, 206.05], [336.69, 281.28]],
    [[336.69, 281.28], [366.59, 406.05], [505.43, 539.10], [616.36, 531.89]],
    [[616.36, 531.89], [708.73, 525.88], [867.72, 417.02], [811.64, 290.17]],
    [[811.64, 290.17], [771.54, 199.44], [670.72, 211.01], [614.72, 242.62]],
    [[614.72, 242.62], [568.24, 268.86], [521.13, 326.71], [567.40, 380.24]],
    [[567.40, 380.24], [605.43, 424.23], [678.15, 432.49], [713.55, 378.69]],
    [[713.55, 378.69], [760.80, 306.88], [693.86, 196.96], [735.89, 170.60]],
    [[735.89, 170.60], [791.37, 135.80], [959.14, 295.31], [959.14, 295.31]],
  ],
  6: [
    [[107.91, 295.31], [139.32, 295.31], [345.10, 296.13], [387.90, 280.57]],
    [[387.90, 280.57], [417.83, 269.69], [470.77, 276.24], [522.47, 222.36]],
    [[522.47, 222.36], [588.14, 153.92], [567.15, 76.17], [629.76, 106.25]],
    [[629.76, 106.25], [735.55, 157.07], [806.21, 384.18], [604.09, 510.31]],
    [[604.09, 510.31], [583.45, 523.19], [492.34, 577.22], [429.81, 530.52]],
    [[429.81, 530.52], [361.78, 479.71], [384.66, 352.33], [513.59, 352.33]],
    [[513.59, 352.33], [596.56, 352.33], [639.40, 405.07], [609.29, 456.82]],
    [[609.29, 456.82], [586.49, 496.01], [501.36, 569.83], [462.70, 479.24]],
    [[462.70, 479.24], [443.48, 434.22], [455.67, 395.27], [496.23, 403.07]],
    [[496.23, 403.07], [541.60, 411.80], [596.49, 474.01], [529.18, 471.47]],
    [[529.18, 471.47], [505.71, 470.58], [500.47, 463.07], [510.05, 430.66]],
    [[510.05, 430.66], [521.96, 390.35], [532.34, 320.61], [607.61, 268.69]],
    [[607.61, 268.69], [724.32, 188.20], [765.65, 310.15], [838.34, 328.33]],
    [[838.34, 328.33], [858.29, 333.31], [900.05, 335.35], [944.26, 330.02]],
  ],
  7: [
    [[131.06, 298.61], [172.38, 300.26], [231.88, 306.88], [277.77, 365.58]],
    [[277.77, 365.58], [344.27, 450.67], [268.24, 499.43], [331.12, 532.44]],
    [[331.12, 532.44], [400.47, 568.85], [517.83, 522.57], [535.19, 473.54]],
    [[535.19, 473.54], [545.92, 443.24], [538.97, 353.98], [474.20, 353.98]],
    [[474.20, 353.98], [429.26, 353.98], [417.83, 396.96], [418.94, 417.01]],
    [[418.94, 417.01], [420.86, 451.52], [465.76, 523.40], [514.72, 458.80]],
    [[514.72, 458.80], [584.77, 366.38], [526.09, 175.47], [581.33, 112.05]],
    [[581.33, 112.05], [615.34, 73.00], [740.96, 26.71], [746.65, 160.35]],
    [[746.65, 160.35], [747.57, 182.08], [750.88, 339.11], [674.69, 292.08]],
    [[674.69, 292.08], [617.00, 256.46], [624.44, 172.17], [670.30, 165.34]],
    [[670.30, 165.34], [702.12, 160.60], [815.34, 115.97], [838.78, 151.90]],
    [[838.78, 151.90], [864.93, 192.00], [753.23, 292.52], [832.31, 393.70]],
    [[832.31, 393.70], [883.94, 459.77], [833.52, 292.00], [902.81, 324.60]],
    [[902.81, 324.60], [940.23, 342.21], [955.89, 326.90], [968.23, 320.92]],
  ],
  8: [
    [[351.71, 328.36], [345.93, 302.74], [315.35, 185.39], [239.50, 180.53]],
    [[239.50, 180.53], [186.43, 177.13], [130.23, 230.02], [168.55, 308.68]],
    [[168.55, 308.68], [193.04, 358.94], [241.80, 390.35], [271.22, 362.56]],
    [[271.22, 362.56], [301.30, 334.15], [286.42, 267.21], [367.23, 226.80]],
    [[367.23, 226.80], [415.35, 202.75], [464.93, 162.25], [535.35, 211.84]],
    [[535.35, 211.84], [582.29, 244.89], [650.88, 326.71], [650.88, 400.89]],
    [[650.88, 400.89], [650.88, 442.41], [629.39, 493.65], [564.91, 510.33]],
    [[564.91, 510.33], [533.53, 518.44], [453.36, 528.36], [422.39, 455.34]],
    [[422.39, 455.34], [407.08, 419.27], [408.74, 374.64], [430.47, 349.65]],
    [[430.47, 349.65], [441.79, 336.63], [463.28, 323.40], [486.03, 350.11]],
    [[486.03, 350.11], [501.30, 368.03], [506.26, 391.17], [483.43, 405.30]],
    [[483.43, 405.30], [471.55, 412.66], [429.40, 431.67], [400.68, 418.31]],
    [[400.68, 418.31], [358.32, 398.61], [343.45, 307.70], [380.23, 268.69]],
    [[380.23, 268.69], [397.99, 249.85], [526.92, 101.09], [653.92, 181.25]],
    [[653.92, 181.25], [728.57, 228.36], [702.12, 291.17], [693.49, 342.96]],
    [[693.49, 342.96], [683.94, 400.26], [696.33, 443.24], [713.48, 453.71]],
    [[713.48, 453.71], [726.09, 461.42], [812.86, 495.30], [793.96, 395.74]],
    [[793.96, 395.74], [788.07, 364.73], [778.98, 357.29], [769.63, 351.68]],
    [[769.63, 351.68], [712.86, 317.62], [693.03, 378.78], [717.35, 388.91]],
    [[717.35, 388.91], [732.70, 395.30], [758.32, 423.40], [796.43, 377.38]],
    [[796.43, 377.38], [845.92, 317.62], [816.17, 253.98], [881.71, 266.75]],
    [[881.71, 266.75], [943.44, 278.78], [918.16, 325.15], [892.84, 334.96]],
    [[892.84, 334.96], [845.92, 353.16], [745.92, 266.38], [745.92, 266.38]],
  ],
  9: [
    [[279.81, 368.03], [233.53, 410.18], [198.82, 461.42], [138.00, 447.16]],
    [[138.00, 447.16], [93.04, 436.63], [79.82, 401.09], [89.16, 342.35]],
    [[89.16, 342.35], [91.39, 328.36], [94.69, 314.31], [117.34, 300.16]],
    [[117.34, 300.16], [160.81, 272.99], [224.44, 277.95], [242.25, 310.75]],
    [[242.25, 310.75], [255.85, 335.80], [300.47, 368.03], [337.58, 366.26]],
    [[337.58, 366.26], [369.89, 364.73], [447.58, 334.97], [417.85, 232.06]],
    [[417.85, 232.06], [404.60, 186.22], [365.76, 111.01], [295.47, 117.09]],
    [[295.47, 117.09], [231.88, 122.58], [201.30, 189.52], [212.99, 224.58]],
    [[212.99, 224.58], [217.83, 239.11], [241.80, 283.74], [309.86, 289.60]],
    [[309.86, 289.60], [337.66, 292.00], [362.46, 287.87], [407.61, 257.76]],
    [[407.61, 257.76], [461.63, 221.75], [655.84, 113.49], [750.49, 133.30]],
    [[750.49, 133.30], [797.99, 143.24], [978.15, 218.45], [862.01, 397.68]],
    [[862.01, 397.68], [844.27, 425.06], [799.64, 486.21], [688.12, 443.00]],
    [[688.12, 443.00], [667.41, 434.97], [569.89, 394.48], [597.92, 291.72]],
    [[597.92, 291.72], [624.44, 194.48], [727.74, 172.17], [796.65, 207.15]],
    [[796.65, 207.15], [835.18, 226.71], [859.14, 262.25], [861.65, 284.44]],
    [[861.65, 284.44], [869.06, 349.85], [705.43, 434.97], [674.36, 331.10]],
    [[674.36, 331.10], [652.53, 258.12], [738.48, 233.32], [751.71, 275.47]],
  ],
};

const HAND_DRAWN_MARK_IDS = [1, 3, 4, 6, 7, 8, 9] as const;

function chooseTransitionMarks() {
  const marks = [...HAND_DRAWN_MARK_IDS];
  for (let index = marks.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [marks[index], marks[swapIndex]] = [marks[swapIndex], marks[index]];
  }
  return marks.slice(0, 4);
}

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
  rippleStartedAt: number | null,
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
      const distanceFromCenter = Math.hypot(
        centerX - metrics.width / 2,
        centerY - metrics.height / 2,
      );
      const edgeStrength = Math.min(1, distanceFromCenter / (Math.min(metrics.width, metrics.height) * 0.7));
      let borderOpacity = 0.3 + edgeStrength * 0.45;
      if (rippleStartedAt !== null) {
        const rippleProgress = Math.min(
          1,
          Math.max(0, (timestamp - rippleStartedAt) / AMBIENT_RIPPLE_DURATION_MS),
        );
        const waveStart = metrics.width + metrics.height + Math.min(metrics.width, metrics.height) * 0.15;
        const waveEnd = -Math.min(metrics.width, metrics.height) * 0.15;
        const wavePosition = waveStart + (waveEnd - waveStart) * rippleProgress;
        const waveWidth = Math.min(metrics.width, metrics.height) * 0.16;
        const planeCoordinate = centerX + centerY;
        const waveBand = Math.exp(-(((planeCoordinate - wavePosition) / waveWidth) ** 2));
        if (waveBand > 0.02) {
          borderColor = accentColor;
          borderOpacity = Math.max(
            borderOpacity * AMBIENT_RIPPLE_BASE_OPACITY_SCALE,
            waveBand * (1 - rippleProgress) * AMBIENT_RIPPLE_PEAK_OPACITY,
          );
        }
      }
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

function cubicBezier(segment: BezierSegment, progress: number): FieldPoint {
  const t = Math.max(0, Math.min(1, progress));
  const inverse = 1 - t;
  return {
    x:
      inverse ** 3 * segment[0][0] +
      3 * inverse ** 2 * t * segment[1][0] +
      3 * inverse * t ** 2 * segment[2][0] +
      t ** 3 * segment[3][0],
    y:
      inverse ** 3 * segment[0][1] +
      3 * inverse ** 2 * t * segment[1][1] +
      3 * inverse * t ** 2 * segment[2][1] +
      t ** 3 * segment[3][1],
  };
}

function normalizeBezierSegments(segments: BezierSegment[]) {
  const start = segments[0][0];
  const end = segments[segments.length - 1][3];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const length = Math.hypot(dx, dy);
  const cos = dx / length;
  const sin = dy / length;

  return segments.map((segment) => segment.map(([x, y]) => {
    const translatedX = x - start[0];
    const translatedY = y - start[1];
    return [
      (translatedX * cos + translatedY * sin) / length,
      (-translatedX * sin + translatedY * cos) / length,
    ] as [number, number];
  }) as BezierSegment);
}

function buildHandDrawnPath(mark: number, start: FieldPoint, target: FieldPoint): PathDefinition {
  const normalized = normalizeBezierSegments(HAND_DRAWN_MARKS[mark]);
  const distance = Math.hypot(target.x - start.x, target.y - start.y);
  const forward = {
    x: (target.x - start.x) / distance,
    y: (target.y - start.y) / distance,
  };
  const perpendicular = { x: forward.y, y: -forward.x };
  const points = Array.from({ length: HAND_DRAWN_PATH_POINT_COUNT }, (_, index) => {
    const pathProgress = index / (HAND_DRAWN_PATH_POINT_COUNT - 1);
    const segmentPosition = pathProgress * normalized.length;
    const segmentIndex = Math.min(normalized.length - 1, Math.floor(segmentPosition));
    const segmentProgress = segmentPosition - segmentIndex;
    const local = cubicBezier(normalized[segmentIndex], segmentProgress);
    return {
      x: start.x + forward.x * local.x * distance + perpendicular.x * local.y * distance,
      y: start.y + forward.y * local.x * distance + perpendicular.y * local.y * distance,
    };
  });

  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  return { points, length };
}

function buildSelfReturnPath(start: FieldPoint, width: number, height: number): PathDefinition {
  const angle = Math.random() * Math.PI * 2;
  const distance = Math.min(width, height) * (0.16 + Math.random() * 0.08);
  const outward = {
    x: start.x + Math.cos(angle) * distance,
    y: start.y + Math.sin(angle) * distance,
  };
  const tangent = { x: -Math.sin(angle), y: Math.cos(angle) };
  const bend = distance * (0.8 + Math.random() * 0.35);
  const firstControl = {
    x: start.x + tangent.x * bend,
    y: start.y + tangent.y * bend,
  };
  const secondControl = {
    x: outward.x + tangent.x * bend,
    y: outward.y + tangent.y * bend,
  };
  const returnControl = {
    x: outward.x - tangent.x * bend,
    y: outward.y - tangent.y * bend,
  };
  const finalControl = {
    x: start.x - tangent.x * bend,
    y: start.y - tangent.y * bend,
  };
  const segments: BezierSegment[] = [
    [[start.x, start.y], [firstControl.x, firstControl.y], [secondControl.x, secondControl.y], [outward.x, outward.y]],
    [[outward.x, outward.y], [returnControl.x, returnControl.y], [finalControl.x, finalControl.y], [start.x, start.y]],
  ];
  const points = Array.from({ length: HAND_DRAWN_PATH_POINT_COUNT }, (_, index) => {
    const progress = index / (HAND_DRAWN_PATH_POINT_COUNT - 1);
    const segment = progress < 0.5 ? segments[0] : segments[1];
    return cubicBezier(segment, (progress % 0.5) * 2);
  });
  let length = 0;
  for (let index = 1; index < points.length; index += 1) {
    length += Math.hypot(points[index].x - points[index - 1].x, points[index].y - points[index - 1].y);
  }
  return { points, length };
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

export default function RoleNavCanvas({
  activeRoleId,
  roleAnchorRefs,
  previewAnchorRef,
  onNucleusImpact,
  onSelfNucleusImpact,
  idleEnabled,
}: RoleNavCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const metricsRef = useRef<GridMetrics | null>(null);
  const anchorRectsRef = useRef<Record<string, DOMRect>>({});
  const previewRectRef = useRef<DOMRect | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const activeCellsRef = useRef<Map<string, number>>(new Map());
  const transitionActiveRef = useRef(false);
  const previousRoleIdRef = useRef<string | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const activeRoleRef = useRef(activeRoleId);
  const nextIdleLaunchAtRef = useRef<number | null>(null);
  const idleEnabledRef = useRef(idleEnabled);
  const nextAmbientRippleAtRef = useRef<number | null>(null);
  const ambientRippleStartedAtRef = useRef<number | null>(null);
  activeRoleRef.current = activeRoleId;
  idleEnabledRef.current = idleEnabled;

  const spawnParticles = useCallback(() => {
    const roleAnchor = roleAnchorRefs.current[activeRoleRef.current];
    if (!roleAnchor) return;

    const roleBounds = roleAnchor.getBoundingClientRect();
    const start = {
      x: roleBounds.left + roleBounds.width / 2,
      y: roleBounds.top + roleBounds.height / 2,
    };
    const previewBounds = previewAnchorRef.current?.getBoundingClientRect() ?? previewRectRef.current;
    const target = previewBounds
      ? {
          x: previewBounds.left + previewBounds.width / 2,
          y: previewBounds.top + previewBounds.height / 2,
        }
      : { x: window.innerWidth * 0.75, y: window.innerHeight / 2 };

    // A role can change while a previous flight is still underway. Let that
    // motion finish as a subdued trace, but reserve nucleus energy for the
    // newest role's particles.
    particlesRef.current.forEach((particle) => {
      particle.status = "stale";
    });

    const currentParticles = chooseTransitionMarks().map((mark, index) => ({
      x: start.x,
      y: start.y,
      path: buildHandDrawnPath(mark, start, target),
      durationMs: HAND_DRAWN_PATH_DURATION_MS,
      mark,
      impactEnergy: index + 1,
      ageMs: -(PARTICLE_LAUNCH_TIMES_MS[index] ?? 0),
      impactReported: false,
      source: "transition" as const,
      status: "current" as const,
    }));
    particlesRef.current.push(...currentParticles);
    transitionActiveRef.current = true;
  }, [previewAnchorRef, roleAnchorRefs]);

  const launchIdleParticle = useCallback(() => {
    const canvas = canvasRef.current;
    const metrics = metricsRef.current;
    const previewBounds = previewAnchorRef.current?.getBoundingClientRect() ?? previewRectRef.current;
    if (!canvas || !metrics || !previewBounds) return;

    const start = {
      x: previewBounds.left + previewBounds.width / 2,
      y: previewBounds.top + previewBounds.height / 2,
    };
    particlesRef.current.push({
      x: start.x,
      y: start.y,
      path: buildSelfReturnPath(start, metrics.width, metrics.height),
      durationMs: IDLE_PARTICLE_DURATION_MS,
      mark: HAND_DRAWN_MARK_IDS[Math.floor(Math.random() * HAND_DRAWN_MARK_IDS.length)],
      impactEnergy: 0,
      ageMs: 0,
      impactReported: false,
      source: "idle",
      status: "current",
    });
    transitionActiveRef.current = true;
    nextIdleLaunchAtRef.current = null;
  }, [previewAnchorRef]);

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
    if (previousRoleIdRef.current === null) {
      previousRoleIdRef.current = activeRoleId;
      return;
    }
    if (previousRoleIdRef.current !== activeRoleId) {
      previousRoleIdRef.current = activeRoleId;
      spawnParticles();
    }
  }, [activeRoleId, spawnParticles]);

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

      if (!idleEnabledRef.current) {
        particlesRef.current = particlesRef.current.filter((particle) => particle.source !== "idle");
        nextIdleLaunchAtRef.current = null;
        if (particlesRef.current.length === 0) transitionActiveRef.current = false;
      } else if (nextIdleLaunchAtRef.current === null) {
        nextIdleLaunchAtRef.current = timestamp + IDLE_LAUNCH_MIN_DELAY_MS + Math.random() *
          (IDLE_LAUNCH_MAX_DELAY_MS - IDLE_LAUNCH_MIN_DELAY_MS);
      }

      if (nextAmbientRippleAtRef.current === null) {
        nextAmbientRippleAtRef.current = timestamp + AMBIENT_RIPPLE_MIN_DELAY_MS + Math.random() *
          (AMBIENT_RIPPLE_MAX_DELAY_MS - AMBIENT_RIPPLE_MIN_DELAY_MS);
      }
      if (
        ambientRippleStartedAtRef.current === null &&
        nextAmbientRippleAtRef.current !== null &&
        timestamp >= nextAmbientRippleAtRef.current
      ) {
        ambientRippleStartedAtRef.current = timestamp;
        nextAmbientRippleAtRef.current = null;
      }
      if (
        ambientRippleStartedAtRef.current !== null &&
        timestamp - ambientRippleStartedAtRef.current > AMBIENT_RIPPLE_DURATION_MS
      ) {
        ambientRippleStartedAtRef.current = null;
        nextAmbientRippleAtRef.current = timestamp + AMBIENT_RIPPLE_MIN_DELAY_MS + Math.random() *
          (AMBIENT_RIPPLE_MAX_DELAY_MS - AMBIENT_RIPPLE_MIN_DELAY_MS);
      }
      if (
        idleEnabledRef.current &&
        !transitionActiveRef.current &&
        nextIdleLaunchAtRef.current !== null &&
        timestamp >= nextIdleLaunchAtRef.current
      ) {
        launchIdleParticle();
      }

      const lineColor =
        getComputedStyle(canvas).getPropertyValue("--role-canvas-line").trim() ||
        "rgba(255, 255, 255, 0.05)";
      const accentColor =
        getComputedStyle(canvas).getPropertyValue("--role-accent").trim() || "#66c7ee";
      particlesRef.current.forEach((particle) => {
        particle.ageMs += elapsedSeconds * 1000;
        if (particle.ageMs < 0) return;

        const previousPosition = { x: particle.x, y: particle.y };
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
        if (time === 1 && !particle.impactReported) {
          particle.impactReported = true;
          if (particle.source === "idle") {
            onSelfNucleusImpact();
          } else if (particle.status === "current") {
            onNucleusImpact(particle.impactEnergy);
          }
        }
      });

      activeCellsRef.current.forEach((activatedAt, key) => {
        if (timestamp - activatedAt > HEX_FADE_HALF_LIFE_MS * 8) {
          activeCellsRef.current.delete(key);
        }
      });

      context.clearRect(0, 0, metrics.width, metrics.height);
      drawHexGrid(
        context,
        metrics,
        lineColor,
        accentColor,
        activeCellsRef.current,
        timestamp,
        ambientRippleStartedAtRef.current,
      );

      // CSS transforms can move the role list without triggering ResizeObserver,
      // so read the live bounds here rather than leaving the canvas highlight at
      // its pre-transform location.
      const activeRoleBounds =
        roleAnchorRefs.current[activeRoleRef.current]?.getBoundingClientRect() ??
        anchorRectsRef.current[activeRoleRef.current];
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

      context.shadowBlur = 10;
      context.globalCompositeOperation = "source-over";
      particlesRef.current.forEach((particle) => {
        if (particle.ageMs < 0) return;
        const isStale = particle.status === "stale";
        const particleColor = HAND_DRAWN_COLORS[particle.mark] ?? PARTICLE_COLOR;
        const particleRadius = isStale ? PARTICLE_RADIUS * 0.72 : PARTICLE_RADIUS;
        context.fillStyle = particleColor;
        context.shadowColor = particleColor;
        context.shadowBlur = isStale ? 3 : 10;
        context.globalAlpha = isStale ? 0.28 : 1;
        context.beginPath();
        context.arc(particle.x, particle.y, particleRadius, 0, Math.PI * 2);
        context.fill();
        context.beginPath();
        context.fillStyle = "#fff4c2";
        context.arc(particle.x, particle.y, particleRadius * 0.45, 0, Math.PI * 2);
        context.fill();
      });
      context.shadowBlur = 0;
      context.globalAlpha = 1;

      particlesRef.current = particlesRef.current.filter(
        (particle) => !particle.impactReported && particle.ageMs < particle.durationMs,
      );
      if (particlesRef.current.length === 0) {
        if (transitionActiveRef.current) {
          nextIdleLaunchAtRef.current = timestamp + IDLE_LAUNCH_MIN_DELAY_MS + Math.random() *
            (IDLE_LAUNCH_MAX_DELAY_MS - IDLE_LAUNCH_MIN_DELAY_MS);
        }
        transitionActiveRef.current = false;
      }

      frame = window.requestAnimationFrame(render);
    };

    frame = window.requestAnimationFrame(render);
    return () => window.cancelAnimationFrame(frame);
  }, [launchIdleParticle, onNucleusImpact, onSelfNucleusImpact, spawnParticles]);

  return (
    <>
      <canvas ref={canvasRef} className="role-nav-canvas" aria-hidden="true" />
    </>
  );
}
