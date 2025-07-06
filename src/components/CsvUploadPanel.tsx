// src/components/CsvUploadPanel.tsx
"use client";

import React, { useState, ChangeEvent } from "react";
import Papa from "papaparse";
import { v4 as uuidv4 } from "uuid";
import styles from "./CsvUploadPanel.module.css";

type ParsedJob = {
  id: string;
  title: string;
  company: string;
  city: string;
  country: string;
  officeType: string;
  experienceLevel: string;
  employmentType: string;
  industries: string[];
  visa: boolean;
  benefits: string[];
  skills: string;
  url: string;
  currency: string;
  salaryLow: string;
  salaryHigh: string;
  type: "job" | "internship";
  postedAt: number;
};

export default function CsvUploadPanel() {
  const [parsedJobs, setParsedJobs] = useState<ParsedJob[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleCsv = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setCsvError("No file selected");
      return;
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data, errors }) => {
        if (errors.length) {
          setCsvError(errors.map((er) => er.message).join("; "));
        } else {
          const rows: ParsedJob[] = (data as any[]).map((row) => ({
            id:
              uuidv4().slice(0, 4) +
              "-" +
              Math.floor(100 + Math.random() * 900),
            title: row.title || "",
            company: row.company || "",
            city: row.city || "",
            country: row.country || "",
            officeType: row.officeType || "",
            experienceLevel: row.experienceLevel || "",
            employmentType: row.employmentType || "",
            industries:
              row.industries?.split(",").map((s: string) => s.trim()) ?? [],
            visa: String(row.visa).toLowerCase() === "yes",
            benefits:
              row.benefits?.split(",").map((s: string) => s.trim()) ?? [],
            skills: row.skills || "",
            url: row.url || "",
            currency: row.currency || "",
            salaryLow: row.salaryLow || "",
            salaryHigh: row.salaryHigh || "",
            type:
              String(row["type"] ?? row["j/i"]).toLowerCase() ===
                "internship" ||
              String(row["j/i"]).toLowerCase() === "i"
                ? "internship"
                : "job",
            postedAt: Date.now(),
          }));
          setParsedJobs(rows);
          setCsvError(null);
        }
      },
      error: (err) => setCsvError(err.message),
    });
  };

  const uploadCsvJobs = async () => {
    if (!parsedJobs.length || uploading) return;
    setUploading(true);
    setUploadedCount(0);

    try {
      for (let i = 0; i < parsedJobs.length; i++) {
        const job = parsedJobs[i];
        await fetch("/api/requests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...job,
            skills: job.skills.split(",").map((s) => s.trim()),
            industry: job.industries.join(","), // for legacy
          }),
        });
        setUploadedCount(i + 1);
      }
      // clear after all done
      setParsedJobs([]);
    } catch (err: any) {
      setCsvError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className={styles.csvSection}>
      <h2>Bulk upload via CSV</h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleCsv}
        disabled={uploading}
        className={styles.fileInput}
      />

      {csvError && <p className={styles.error}>{csvError}</p>}

      {parsedJobs.length > 0 && (
        <button
          onClick={uploadCsvJobs}
          disabled={uploading}
          className={styles.uploadBtn}
        >
          {uploading
            ? `Uploading (${uploadedCount}/${parsedJobs.length})`
            : `Upload ${parsedJobs.length} Requests`}
        </button>
      )}

      <p className={styles.templateNote}>
        Need the template?{" "}
        <a href="/format.csv" download>
          Click here to download the CSV format
        </a>
      </p>
    </section>
  );
}
