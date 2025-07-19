// src/app/solutions/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import styles from "./page.module.css";

// Dynamically import components to ensure they only run on the client
const RotatingText = dynamic(
  () => import("../../components/RotatingText").then((mod) => mod.default),
  { ssr: false }
);
const GradientText = dynamic(
  () => import("../../components/GradientText").then((mod) => mod.default),
  { ssr: false }
);
const Hyperspeed = dynamic(
  () => import("../../components/HyperSpeed").then((mod) => mod.default),
  { ssr: false }
);
const ConsultationModal = dynamic(
  () => import("../../components/ConsultationModal").then((mod) => mod.default),
  { ssr: false }
);

export default function SolutionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.body.style.backgroundColor = "#0a0a0a";
    return () => {
      document.body.style.backgroundColor = "";
    };
  }, []);

  return (
    <>
      <main className="relative">
        <div className={styles.backgroundContainer}>
          <Hyperspeed
            effectOptions={{
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

        <div className={`${styles.container} relative z-10`}>
          {/* Hero Section */}
          <section className={styles.hero}>
            <h1 className={styles.heroTitle}>
              Your Talent Acquisition, Completely
              <RotatingText
                texts={["Solved.", "Automated.", "Upgraded.", "Perfected."]}
                mainClassName={styles.rotatingTextMain}
                splitLevelClassName={styles.rotatingTextSplit}
              />
            </h1>
            <p className={styles.heroSubtitle}>
              Forget the endless sourcing, messy spreadsheets, and unqualified
              candidates. We build and manage your entire hiring ecosystem, from
              your careers page to your next great hire, so you can focus on
              growth.
            </p>
            <button
              className={styles.ctaButton}
              onClick={() => setIsModalOpen(true)}
            >
              Build My Hiring Engine
            </button>
          </section>

          {/* Problem Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <GradientText>Stop the Hiring Chaos.</GradientText>
            </h2>
            <div className={styles.problemList}>
              <p>
                <strong>Wasted Hours:</strong> Are your best people spending more
                time sifting through resumes than doing their actual jobs?
              </p>
              <p>
                <strong>Lost Candidates:</strong> Is a slow, clunky process
                causing you to lose top talent to competitors?
              </p>
              <p>
                <strong>Weak Brand:</strong> Does your careers page fail to
                attract the high-caliber candidates you truly want?
              </p>
            </div>
          </section>

          {/* Solutions Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <GradientText>Our All-in-One Talent Solution</GradientText>
            </h2>
            <div className={styles.services}>
              <div className={styles.serviceCard}>
                <h4>Become a Talent Magnet</h4>
                <p>
                  We don't just build careers pages; we build your employer brand.
                  We'll create a stunning, magnetic destination that tells your
                  story and converts top-tier visitors into passionate applicants.
                </p>
              </div>
              <div className={styles.serviceCard}>
                <h4>Your Elite Talent Scouts</h4>
                <p>
                  Our expert team becomes an extension of yours. We go beyond job
                  boards to actively source, vet, and engage with passive
                  candidates, delivering a pre-qualified shortlist directly to
                  you.
                </p>
              </div>
              <div className={styles.serviceCard}>
                <h4>The Effortless Hiring OS</h4>
                <p>
                  We build your entire operational backbone. This includes
                  implementing the perfect ATS, automating workflows, and even
                  developing **custom interview tools** to ensure you identify
                  the right skills, every time.
                </p>
              </div>
            </div>
          </section>

          {/* Feature Spotlight Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <GradientText>Your Custom Interview Toolkit</GradientText>
            </h2>
            <p className={styles.featureText}>
              Standard interviews are broken. We build bespoke, role-specific interview platforms and technical assessments for your company. Imagine this: Instead of a simple video call, your candidates are in a collaborative coding environment tailored to your tech stack. Instead of guessing culture fit, you have structured, data-driven interview modules. This is how you stop guessing and start hiring with confidence.
            </p>
          </section>
        </div>
      </main>

      <AnimatePresence>
        {isModalOpen && <ConsultationModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
