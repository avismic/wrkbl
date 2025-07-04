// src/app/jobs/[id]/page.tsx
'use client';

import { notFound } from "next/navigation";
import { jobs } from "../../../data/jobs";

interface Params {
  id: string;
}

export default function JobPage({ params }: { params: Params }) {
  const job = jobs.find((j) => j.id === params.id);
  if (!job) return notFound();

  return (
    <main style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>{job.title}</h1>

      <p>
        <strong>Company:</strong> {job.company}
      </p>

      <p>
        <strong>Location:</strong>{" "}
        {job.city}
        {job.country ? `, ${job.country}` : ""} ({job.officeType})
      </p>

      <p>
        <strong>Experience Level:</strong> {job.experienceLevel}
      </p>

      <p>
        <strong>Employment Type:</strong> {job.employmentType}
      </p>

      <p>
        <strong>Industry:</strong> {job.industry}
      </p>

      <p>
        <strong>Visa Sponsorship:</strong> {job.visa ? "Yes" : "No"}
      </p>

      <p>
        <strong>Benefits:</strong> {job.benefits.join(", ")}
      </p>

      <p>
        <strong>Skills:</strong> {job.skills.join(", ")}
      </p>

      <p>
        <strong>Salary:</strong>{" "}
        {job.currency}
        {job.salaryLow.toLocaleString()} – {job.currency}
        {job.salaryHigh.toLocaleString()}
      </p>

      <button
        style={{
          marginTop: "1.5rem",
          padding: "0.75rem 1.5rem",
          fontSize: "1rem",
          backgroundColor: "green",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
        }}
        onClick={() => window.open(job.url, "_blank")}
      >
        Apply Now
      </button>

      <p style={{ marginTop: "1rem" }}>
        ← <a href="/">Back to Listings</a>
      </p>
    </main>
  );
}
