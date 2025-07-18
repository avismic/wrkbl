// src/app/solutions/page.tsx

"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import styles from "./page.module.css";

// Dynamically import the new components to ensure they only run on the client
const RotatingText = dynamic(
  () => import("../../components/RotatingText").then((mod) => mod.default),
  { ssr: false }
);
const GradientText = dynamic(
  () => import("../../components/GradientText").then((mod) => mod.default),
  { ssr: false }
);

// We need to dynamically import the Hyperspeed component as well
const Hyperspeed = dynamic(
  () => import("../../components/HyperSpeed").then((mod) => mod.default),
  { ssr: false }
);


export default function SolutionsPage() {
  useEffect(() => {
    // Set a dark background for this page specifically
    document.body.style.backgroundColor = "#0a0a0a";
    // Clean up when the component unmounts
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <main className="relative">
      {/* Background Effect Container */}
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

      {/* Content Wrapper with higher z-index and constrained width */}
      <div className={`${styles.container} relative z-10`}>
        {/* Hero Section */}
        <section className={styles.hero}>
          <h1 className={styles.heroTitle}>
            We Build Your Entire Talent Pipeline, from
            <RotatingText
              texts={["Careers Page", "First Hire", "ATS Setup", "Onboarding"]}
              mainClassName={styles.rotatingTextMain}
              splitLevelClassName={styles.rotatingTextSplit}
            />
          </h1>
          <p className={styles.heroSubtitle}>
            Stop searching for candidates. Start building a world-class team with our end-to-end talent acquisition solutions.
          </p>
          <button className={styles.ctaButton}>Book a Consultation</button>
        </section>

        {/* Services Section */}
        <section className={styles.services}>
          <div className={styles.serviceCard}>
            <GradientText className={styles.gradientTitle}>
              Employer Branding
            </GradientText>
            <p>
              We design and build stunning, high-performance careers pages that
              attract top-tier talent and showcase your company culture.
            </p>
          </div>
          <div className={styles.serviceCard}>
            <GradientText className={styles.gradientTitle}>
              Active Sourcing
            </GradientText>
            <p>
              Our team becomes your team. We actively source, vet, and interview
              candidates, presenting you with a shortlist of the best fits.
            </p>
          </div>
          <div className={styles.serviceCard}>
            <GradientText className={styles.gradientTitle}>
              Process Automation
            </GradientText>
            <p>
              From Applicant Tracking System (ATS) implementation to automated
              onboarding workflows, we streamline your entire hiring process.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
