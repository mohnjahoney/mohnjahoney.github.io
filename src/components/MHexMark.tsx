import { createHexagonPath, createMOutlinePoints, pointsToPath } from "./mHexGeometry";

export default function MHexMark() {
  const hexagonPath = createHexagonPath();
  const mOutlinePath = pointsToPath(createMOutlinePoints());

  return (
    <svg className="m-hex-wordmark" viewBox="0 0 128 128" aria-hidden="true" focusable="false">
      <path className="m-hex-wordmark__hex" d={hexagonPath} />
      <path className="m-hex-wordmark__m" d={mOutlinePath} />
    </svg>
  );
}
