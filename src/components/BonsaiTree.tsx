import React from 'react';

const NUM_FRAMES = 10; // Now corresponds to 10 individual images (0-9)
const IMAGE_SIZE = 256; // Size of the image in pixels

const imagePaths = Array.from(
  { length: NUM_FRAMES },
  (_, i) => `src/assets/bonsai-frames/frame-${i}.png`
);

interface GrowthAnimationProps {
  streak: number;
}

const GrowthAnimation: React.FC<GrowthAnimationProps> = ({ streak }) => {
  const effectiveStreak = Math.max(0, streak);
  const frameIndex = Math.min(effectiveStreak, NUM_FRAMES - 1);
  const imageSrc = imagePaths[frameIndex];

  const style: React.CSSProperties = {
    width: `${IMAGE_SIZE}px`,
    height: `${IMAGE_SIZE}px`,
    imageRendering: 'pixelated',
  };

  return (
    <img
      src={imageSrc}
      alt={`Bonsai growth stage for streak ${streak}`}
      style={style}
      width={IMAGE_SIZE}
      height={IMAGE_SIZE}
    />
  );
};

export default GrowthAnimation;
