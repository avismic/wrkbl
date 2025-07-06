// src/app/jobs/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { jobs } from "../../../data/jobs";

export default async function JobPage(
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) await the dynamic id
  const { id } = await params;

  // 2) look up the job
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  // 3) render
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

      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: "none" }}
      >
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
        >
          Apply Now
        </button>
      </a>

      <p style={{ marginTop: "1rem" }}>
        ← <Link href="/">Back to Listings</Link>
      </p>
    </main>
  );
}
