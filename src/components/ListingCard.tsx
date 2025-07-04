// src/components/ListingCard.tsx
import React from "react";
import styles from "./ListingCard.module.css";

export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  country: string;
  officeType: "Remote" | "Hybrid" | "In-Office" | "Remote-Anywhere";
  experienceLevel:
    | "Intern"
    | "Entry-level"
    | "Associate/Mid-level"
    | "Senior-level"
    | "Managerial"
    | "Executive";
  employmentType:
    | "Full-time"
    | "Part-time"
    | "Contract"
    | "Temporary"
    | "Freelance";
  industry: string;
  visa: boolean;
  benefits: string[];
  skills: string[];
  url: string;
  postedAt: number;
  type: "job" | "internship";
  currency: string;
  salaryLow: number;
  salaryHigh: number;
}

interface Props {
  job: Job;
}

export default function ListingCard({ job }: Props) {
  const href = /^[a-zA-Z][\w+.-]*:\/\//.test(job.url)
    ? job.url
    : `https://${job.url}`;

  const locationText = job.city
    ? `${job.city}${job.country ? `, ${job.country}` : ""}`
    : "";

  const typeLabel = job.type === "internship" ? "INTERNSHIP" : "JOB";

  const salaryText = `${job.currency}${job.salaryLow.toLocaleString()} – ${
    job.currency
  }${job.salaryHigh.toLocaleString()}`;

  const date = new Date(job.postedAt);
  const dateString = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty("--x", `${x}%`);
    e.currentTarget.style.setProperty("--y", `${y}%`);
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
        <span className={styles.jobType}>{typeLabel}</span>
        <span className={styles.postedAt}>{dateString}</span>
      </div>

      <h2 className={styles.title}>{job.title}</h2>

      <div className={styles.sub}>
        <span className={styles.company}>{job.company}</span>
        {locationText && <span className={styles.location}>· {locationText}</span>}
      </div>

      <div className={styles.badges}>
        <span className={styles.badge}>{job.officeType}</span>
        <span className={styles.badge}>{job.experienceLevel}</span>
        <span className={styles.badge}>{job.employmentType}</span>
        <span className={styles.badge}>{job.industry}</span>
      </div>

      <div className={styles.salary}>{salaryText}</div>

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
