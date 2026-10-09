import { useEffect, useRef, useState } from "react";

const LUMINANCE_CUT = 0.5;

function createSplitImage(source: HTMLImageElement, keepDark: boolean) {
  const canvas = document.createElement("canvas");
  canvas.width = source.naturalWidth;
  canvas.height = source.naturalHeight;
  const context = canvas.getContext("2d");
  if (!context) return "";

  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

  for (let index = 0; index < pixels.data.length; index += 4) {
    const luminance =
      (pixels.data[index] * 0.2126 +
        pixels.data[index + 1] * 0.7152 +
        pixels.data[index + 2] * 0.0722) /
      255;
    const belongsToLayer = keepDark ? luminance <= LUMINANCE_CUT : luminance > LUMINANCE_CUT;

    if (!belongsToLayer) {
      pixels.data[index + 3] = 0;
    }
  }

  context.putImageData(pixels, 0, 0);
  return canvas.toDataURL("image/png");
}

export default function SplitProfile() {
  const frameRef = useRef<HTMLDivElement>(null);
  const [splitImages, setSplitImages] = useState<{ a: string; b: string } | null>(null);

  useEffect(() => {
    const image = new Image();
    image.src = "/profile-photo.png";
    image.onload = () => {
      setSplitImages({
        a: createSplitImage(image, true),
        b: createSplitImage(image, false),
      });
    };
  }, []);

  useEffect(() => {
    function updateOffset(event: globalThis.PointerEvent) {
      const frame = frameRef.current;
      if (!frame) return;

      const bounds = frame.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const directionX = event.clientX - centerX;
      const directionY = event.clientY - centerY;
      const distance = Math.hypot(directionX, directionY);
      const separation = distance / 10;

      if (distance === 0) {
        frame.style.setProperty("--split-x", "0px");
        frame.style.setProperty("--split-y", "0px");
        return;
      }

      frame.style.setProperty("--split-x", `${(directionX / distance) * separation}px`);
      frame.style.setProperty("--split-y", `${(directionY / distance) * separation}px`);
    }

    function resetOffset() {
      const frame = frameRef.current;
      frame?.style.setProperty("--split-x", "0px");
      frame?.style.setProperty("--split-y", "0px");
    }

    window.addEventListener("pointermove", updateOffset);
    window.addEventListener("blur", resetOffset);
    return () => {
      window.removeEventListener("pointermove", updateOffset);
      window.removeEventListener("blur", resetOffset);
    };
  }, []);

  return (
    <div
      ref={frameRef}
      className="split-profile"
      role="img"
      aria-label="Interactive split portrait"
    >
      {splitImages && (
        <>
          <div className="split-profile-layer split-profile-layer-a">
            <img src={splitImages.a} alt="" />
          </div>
          <div className="split-profile-layer split-profile-layer-b">
            <img src={splitImages.b} alt="" />
          </div>
        </>
      )}
    </div>
  );
}
