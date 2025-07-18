// src/app/solutions/page.tsx

"use client";

import { useEffect } from "react"; // 1. Import useEffect
import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { hyperspeedPresets } from "../../components/hyperSpeedPresets";

const Hyperspeed = dynamic(
  () => import("../../components/HyperSpeed").then((mod) => mod.default),
  { ssr: false }
);

export default function SolutionsPage() {
  // 2. Add the useEffect hook
  useEffect(() => {
    // Set the background color when the component mounts
    document.body.style.backgroundColor = "#000000"; // Black background

    // Cleanup function to reset the style when the component unmounts
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []); // The empty array ensures this runs only once on mount and cleanup

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div className={styles.backgroundContainer}>
        <Hyperspeed
          effectOptions={{
            onSpeedUp: () => {},
            onSlowDown: () => {},
            distortion: "deepDistortion",
            length: 400,
            roadWidth: 18,
            islandWidth: 2,
            lanesPerRoad: 3,
            fov: 90,
            fovSpeedUp: 150,
            speedUp: 2,
            carLightsFade: 0.4,
            totalSideLightSticks: 50,
            lightPairsPerRoadWay: 50,
            shoulderLinesWidthPercentage: 0.05,
            brokenLinesWidthPercentage: 0.1,
            brokenLinesLengthPercentage: 0.5,
            lightStickWidth: [0.12, 0.5],
            lightStickHeight: [1.3, 1.7],
            movingAwaySpeed: [60, 80],
            movingCloserSpeed: [-120, -160],
            carLightsLength: [400 * 0.05, 400 * 0.15],
            carLightsRadius: [0.05, 0.14],
            carWidthPercentage: [0.3, 0.5],
            carShiftX: [-0.2, 0.2],
            carFloorSeparation: [0.05, 1],
            colors: {
              roadColor: 0x080808,
              islandColor: 0x0a0a0a,
              background: 0x000000,
              shoulderLines: 0x131318,
              brokenLines: 0x131318,
              leftCars: [0xff322f, 0xa33010, 0xa81508],
              rightCars: [0xfdfdf0, 0xf3dea0, 0xe2bb88],
              sticks: 0xfdfdf0,
            },
          }}
        />
      </div>

      <div className="z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
          Hyperspeed Solutions
        </h1>
        <p className="mt-4 text-lg text-gray-300 drop-shadow-md">
          Click and hold anywhere to see the magic!
        </p>
      </div>
    </main>
  );
}
