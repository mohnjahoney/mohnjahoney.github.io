import { useEffect, useRef, useState } from "react";

function ThresholdCanvas({
  image,
  threshold,
  keepBright,
}: {
  image: HTMLImageElement;
  threshold: number;
  keepBright: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);

    for (let index = 0; index < pixels.data.length; index += 4) {
      const luminance =
        pixels.data[index] * 0.2126 +
        pixels.data[index + 1] * 0.7152 +
        pixels.data[index + 2] * 0.0722;
      const isBright = luminance >= threshold;
      if (isBright !== keepBright) {
        pixels.data[index + 3] = 0;
      }
    }

    context.putImageData(pixels, 0, 0);
  }, [image, threshold, keepBright]);

  return (
    <canvas ref={canvasRef} role="img" aria-label={keepBright ? "Light pixels" : "Dark pixels"} />
  );
}

export default function MaskExperiment() {
  const [sliderValue, setSliderValue] = useState(127);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const threshold = 255 - sliderValue;

  useEffect(() => {
    const profileImage = new Image();
    // profileImage.src = "/dist/swirl-gradient.png";
    // profileImage.src = "/dist/radial-gradient.png";
    profileImage.src = "/public/profile-photo.png";
    // profileImage.src = "/public/linear-gradient.png";
    // profileImage.src = "/public/grayscale-mountains.png";
    profileImage.onload = () => setImage(profileImage);
  }, []);

  return (
    <div className="mask-experiment">
      <div className="mask-experiment-images">
        <figure className="mask-experiment-light-panel">
          {image && <ThresholdCanvas image={image} threshold={threshold} keepBright={true} />}
          <figcaption>Light pixels</figcaption>
        </figure>
        <figure className="mask-experiment-dark-panel">
          {image && <ThresholdCanvas image={image} threshold={threshold} keepBright={false} />}
          <figcaption>Dark pixels</figcaption>
        </figure>
      </div>
      <div className="mask-experiment-control">
        <label htmlFor="mask-threshold">Threshold</label>
        <input
          id="mask-threshold"
          type="range"
          min="0"
          max="255"
          value={sliderValue}
          onChange={(event) => setSliderValue(Number(event.target.value))}
          aria-valuetext={`${threshold} of 255`}
        />
        <div className="mask-experiment-scale" aria-hidden="true">
          <span>White</span>
          <output>{threshold}</output>
          <span>Black</span>
        </div>
      </div>
    </div>
  );
}
