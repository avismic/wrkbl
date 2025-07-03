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
        <strong>Location:</strong> {job.location}
      </p>
      <p>
        <strong>Skills:</strong> {job.skills.join(", ")}
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
