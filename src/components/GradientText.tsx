// src/components/GradientText.tsx

import styles from "./GradientText.module.css";
import React, { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export default function GradientText({
  children,
  className = "",
  colors = ["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };
  return (
    <div className={`${styles.animatedGradientText} ${className}`}>
      {showBorder && (
        <div className={styles.gradientOverlay} style={gradientStyle}></div>
      )}
      <div className={styles.textContent} style={gradientStyle}>
        {children}
      </div>
    </div>
  );
}
