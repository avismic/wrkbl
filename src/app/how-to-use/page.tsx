// src/app/how-to-use/page.tsx
import React from "react";
import styles from "./page.module.css";

const steps = [
  {
    title: "Search Listings",
    description: "Use the search bar and filters on the homepage to find jobs that match your interests.",
  },
  {
    title: "View Details",
    description: "Click on any job card to see full details and the “Apply” link.",
  },
  {
    title: "Post a Request",
    description: "If you can’t find what you’re looking for, submit a Job Request via the “Post a Job” page.",
  },
  {
    title: "Manage via Admin",
    description: "Admins can review and publish incoming requests from the Admin Console.",
  },
];

export default function HowToUsePage() {
  return (
    <main className={styles.container}>
      <h1>How To Use Mayocity</h1>
      <ul className={styles.steps}>
        {steps.map((step, idx) => (
          <li key={idx} className={styles.step}>
            <h2>{idx + 1}. {step.title}</h2>
            <p>{step.description}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
