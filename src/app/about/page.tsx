import React from "react";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.heading}>About MayoCity</h1>
      <div className={styles.content}>
        <p>
          MayoCity is a simple, no-nonsense job board built by Abhishek to connect great
          talent with forward-thinking companies. Our mission is to strip away
          the clutter and let you discover your next opportunity—quickly and
          directly.
        </p>
        <p>
          Whether you’re hunting for a full-time role or an internship, MayoCity
          gives you filtered, up-to-date listings in one place. No fancy
          algorithms, no lengthy signup forms—just a clean, intuitive interface
          to find what you really want.
        </p>
        <h2 className={styles.subheading}>Our Story</h2>
        <p>
          Created by a small team of developers frustrated with over-engineered
          recruiting platforms, MayoCity launched in 2025 as an open-source
          project. We believe hiring should be transparent, respectful, and
          efficient—so we built it that way.
        </p>
        <h2 className={styles.subheading}>Get in Touch</h2>
        <p>
          Have questions, feedback, or want to contribute? Drop us a line at{" "}
          <a href="mailto:hello@mayocity.com">hello@mayocity.com</a> or follow
          us on{" "}
          <a href="https://twitter.com/mayocity" target="_blank" rel="noreferrer">
            Twitter
          </a>
          .
        </p>
      </div>
    </main>
  );
}
