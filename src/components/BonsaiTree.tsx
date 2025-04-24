import React from 'react';

const FRAME_SIZE = 256; // Size of each frame in pixels
const NUM_FRAMES = 11; // Number of frames in the sprite sheet

const GrowthAnimation = (props) => {
  const effectiveStreak = Math.max(0, Math.min(props.streak, NUM_FRAMES));
  const frameIndex =
    effectiveStreak === 0 ? 0 : Math.min(effectiveStreak - 1, NUM_FRAMES - 1);

  const col = frameIndex;
  const backgroundPositionX = `-${col * FRAME_SIZE}px`;
  const backgroundPositionY = '0px';

  const style = {
    backgroundImage: `url('src/assets/bonsai-growth.png')`,
    backgroundPosition: `${backgroundPositionX} ${backgroundPositionY}`,
    backgroundRepeat: 'no-repeat',
    width: `${FRAME_SIZE}px`,
    height: `${FRAME_SIZE}px`,
    imageRendering: 'pixelated' as React.CSSProperties['imageRendering'],
  };

  return (
    <div
      style={style}
      aria-label={`Bonsai growth animation frame for streak ${props.streak}`}
      role="img"
    />
  );
};

export default GrowthAnimation;
