// app/page.tsx

"use client"; // 1. Mark this as a Client Component

import dynamic from "next/dynamic";
import styles from "./page.module.css";
import { hyperspeedPresets } from "../../components/hyperSpeedPresets"; // 2. Import your presets

// 3. Dynamically import the Hyperspeed component with SSR turned off
const Hyperspeed = dynamic(
  () => import("../../components/HyperSpeed").then((mod) => mod.default),
  { ssr: false }
);

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-24">
      {/* 4. Use the component and pass in a preset */}
      <Hyperspeed
        effectOptions={{
          onSpeedUp: () => {},
          onSlowDown: () => {},
          distortion: "turbulentDistortion",
          length: 400,
          roadWidth: 10,
          islandWidth: 2,
          lanesPerRoad: 4,
          fov: 90,
          fovSpeedUp: 150,
          speedUp: 2,
          carLightsFade: 0.4,
          totalSideLightSticks: 20,
          lightPairsPerRoadWay: 40,
          shoulderLinesWidthPercentage: 0.05,
          brokenLinesWidthPercentage: 0.1,
          brokenLinesLengthPercentage: 0.5,
          lightStickWidth: [0.12, 0.5],
          lightStickHeight: [1.3, 1.7],
          movingAwaySpeed: [60, 80],
          movingCloserSpeed: [-120, -160],
          carLightsLength: [400 * 0.03, 400 * 0.2],
          carLightsRadius: [0.05, 0.14],
          carWidthPercentage: [0.3, 0.5],
          carShiftX: [-0.8, 0.8],
          carFloorSeparation: [0, 5],
          colors: {
            roadColor: 0x080808,
            islandColor: 0x0a0a0a,
            background: 0x000000,
            shoulderLines: 0xffffff,
            brokenLines: 0xffffff,
            leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
            rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
            sticks: 0x03b3c3,
          },
        }}
      />

      {/* Your other page content goes here */}
      <div className="z-10 text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white drop-shadow-lg">
          Hyperspeed Effect
        </h1>
        <p className="mt-4 text-lg text-gray-300 drop-shadow-md">
          Click and hold to see the magic!
        </p>
      </div>
    </main>
  );
}
