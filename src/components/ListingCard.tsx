// src/components/ListingCard.tsx
import React from "react";
import styles from "./ListingCard.module.css";

export interface Job {
  /* ...same as before... */
}

interface Props {
  job: Job;
}

export default function ListingCard({ job }: Props) {
  const href = /^[a-zA-Z][\w+.-]*:\/\//.test(job.url)
    ? job.url
    : `https://${job.url}`;

  const locationText = job.remote ? `${job.location} (Remote)` : job.location;
  const typeLabel = job.type === "internship" ? "INTERNSHIP" : "JOB";
  const salaryText = `${job.currency}${job.salaryLow.toLocaleString()} – ${
    job.currency
  }${job.salaryHigh.toLocaleString()}`;
  const date = new Date(job.postedAt);

  // Update CSS vars for gradient center as the mouse moves
  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    (e.currentTarget as HTMLElement).style.setProperty("--x", `${x}%`);
    (e.currentTarget as HTMLElement).style.setProperty("--y", `${y}%`);
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
      onMouseMove={handleMouseMove}
    >
      <div className={styles.meta}>
        <span className={styles.type}>{typeLabel}</span>
        <span className={styles.postedAt}>
          {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}
        </span>
      </div>
      <h2 className={styles.title}>{job.title}</h2>
      <p className={styles.company}>{job.company}</p>
      <p className={styles.location}>{locationText}</p>
      <p className={styles.salary}>{salaryText}</p>
      <div className={styles.skills}>
        {job.skills.map((skill) => (
          <span key={skill} className={styles.chip}>
            {skill}
          </span>
        ))}
      </div>
    </a>
  );
}
