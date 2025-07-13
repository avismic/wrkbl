// src/components/ListingCard.tsx
import React from "react";
import styles from "./ListingCard.module.css";

export interface Job {
  id: string;
  title: string;
  company: string;
  city: string;
  country: string;
  officeType: "Remote" | "Hybrid" | "In-Office" | "Remote-Anywhere" | "";
  experienceLevel:
    | "Intern"
    | "Entry-level"
    | "Associate/Mid-level"
    | "Senior-level"
    | "Managerial"
    | "Executive"
    | "";
  employmentType:
    | "Full-time"
    | "Part-time"
    | "Contract"
    | "Temporary"
    | "Freelance"
    | "";
  industries: string[]; // array of non-empty strings
  visa: boolean;
  benefits: string[];
  skills: string[];
  url: string;
  postedAt: number;
  type: "job" | "internship";
  currency: string; // e.g. "USD"
  salaryLow: number;
  salaryHigh: number;
}

interface Props {
  job: Job;
}

export default function ListingCard({ job }: Props) {
  const href: string = /^[a-zA-Z][\w+.-]*:\/\//.test(job.url)
    ? job.url
    : `https://${job.url}`;

  const locationText: string = job.city
    ? `${job.city}${job.country ? `, ${job.country}` : ""}`
    : "";

  const typeLabel: string = job.type === "internship" ? "INTERNSHIP" : "JOB";

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    SEK: "kr",
    NZD: "NZ$",
    INR: "₹",
  };
  const symbol: string = currencySymbols[job.currency] ?? job.currency;

  const hasSalary: boolean = job.salaryLow > 0 || job.salaryHigh > 0;

  const salaryText: string = `${symbol}${job.salaryLow.toLocaleString()} – ${symbol}${job.salaryHigh.toLocaleString()}`;

  const date: Date = new Date(job.postedAt);
  const dateString: string = `${date.getDate()}/${
    date.getMonth() + 1
  }/${date.getFullYear()}`;

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>): void => {
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
        {locationText && (
          <span className={styles.location}>· {locationText}</span>
        )}
      </div>

      <div className={styles.badges}>
        {job.officeType && (
          <span className={styles.badge}>{job.officeType}</span>
        )}
        {job.experienceLevel && (
          <span className={styles.badge}>{job.experienceLevel}</span>
        )}
        {job.employmentType && (
          <span className={styles.badge}>{job.employmentType}</span>
        )}
        {job.industries.map((ind: string) =>
          ind ? (
            <span key={ind} className={styles.badge}>
              {ind}
            </span>
          ) : null
        )}
      </div>

      {hasSalary && <div className={styles.salary}>{salaryText}</div>}

      <div className={styles.skills}>
        {job.skills.map((skill: string) => (
          <span key={skill} className={styles.chip}>
            {skill}
          </span>
        ))}
      </div>
    </a>
  );
}
