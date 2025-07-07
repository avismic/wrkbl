// src/components/ListingCard.tsx
import React from "react";
import TiltedCard from "./TiltedCard";
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
  industries: string[];
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

  // build your existing card markup once
  const cardContent = (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.cardInner}
    >
      <div className={styles.meta}>
        <span className={styles.jobType}>
          {job.type === "internship" ? "INTERNSHIP" : "JOB"}
        </span>
        <span className={styles.postedAt}>
          {(() => {
            const d = new Date(Number(job.postedAt));
            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
          })()}
        </span>
      </div>

      <h2 className={styles.title}>{job.title}</h2>

      <div className={styles.sub}>
        <span className={styles.company}>{job.company}</span>
        {job.city && (
          <span className={styles.location}>
            · {job.city}
            {job.country ? `, ${job.country}` : ""}
          </span>
        )}
      </div>

      <div className={styles.badges}>
        <span className={styles.badge}>{job.officeType}</span>
        <span className={styles.badge}>{job.experienceLevel}</span>
        <span className={styles.badge}>{job.employmentType}</span>
        {job.industries.map((ind) => (
          <span key={ind} className={styles.badge}>
            {ind}
          </span>
        ))}
      </div>

      <div className={styles.salary}>
        {/* currency symbol logic */}
        {job.currency} {job.salaryLow.toLocaleString()} –{" "}
        {job.currency} {job.salaryHigh.toLocaleString()}
      </div>

      <div className={styles.skills}>
        {job.skills.map((s) => (
          <span key={s} className={styles.chip}>
            {s}
          </span>
        ))}
      </div>
    </a>
  );

  return (
    <TiltedCard
      containerWidth="100%"
      containerHeight="auto"
      imageWidth="100%"
      imageHeight="auto"
      scaleOnHover={1.02}
      rotateAmplitude={8}
      showMobileWarning={false}
      showTooltip={false}
      displayOverlayContent={true}
      overlayContent={cardContent}
    />
  );
}
