// src/components/TiltedCard.tsx
import React from 'react';
import './TiltedCard.css'; // whatever styles/animation you need

interface TiltedCardProps {
  imageSrc: string;
  altText: string;
  captionText?: string;
  containerHeight?: string;
  containerWidth?: string;
  imageHeight?: string;
  imageWidth?: string;
  rotateAmplitude?: number;
  scaleOnHover?: number;
  showMobileWarning?: boolean;
  showTooltip?: boolean;
  displayOverlayContent?: boolean;
  overlayContent?: React.ReactNode;
}

export default function TiltedCard({
  imageSrc,
  altText,
  captionText,
  containerHeight = '300px',
  containerWidth = '300px',
  imageHeight = '300px',
  imageWidth = '300px',
  rotateAmplitude = 12,
  scaleOnHover = 1.2,
  showMobileWarning = true,
  showTooltip = false,
  displayOverlayContent = false,
  overlayContent,
}: TiltedCardProps) {
  // ... your tilt logic here (listeners on mousemove, css transforms, etc.)
  return (
    <div
      className="tilted-card-container"
      style={{
        height: containerHeight,
        width: containerWidth,
        '--tilt-amp': `${rotateAmplitude}deg`,
        '--tilt-scale': scaleOnHover,
      } as any}
      title={showTooltip ? captionText : undefined}
    >
      <img
        src={imageSrc}
        alt={altText}
        style={{ height: imageHeight, width: imageWidth }}
      />
      {displayOverlayContent && (
        <div className="tilted-card-overlay">{overlayContent}</div>
      )}
      {showMobileWarning && <div className="tilted-card-warning">↥ Tilt me! ↥</div>}
    </div>
  );
}
