// src/components/CsvUploadPanel.tsx
"use client";

import React, { useState, ChangeEvent } from "react";
// @ts-ignore: no shipped types for papaparse
import Papa, { ParseError, ParseResult } from "papaparse";
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
  benefits: string; // now a comma-separated string
  skills: string[]; // <— array of strings
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
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedCount, setUploadedCount] = useState<number>(0);

  const handleCsv = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) {
      setCsvError("No file selected");
      return;
    }

    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: ParseResult<any>): void => {
        const { data, errors } = results;
        if (errors.length) {
          setCsvError(errors.map((er: ParseError) => er.message).join("; "));
          return;
        }

        const rows: ParsedJob[] = data.map(
          (row: any): ParsedJob => ({
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
              typeof row.industries === "string"
                ? row.industries.split(",").map((s: string) => s.trim())
                : Array.isArray(row.industries)
                ? row.industries
                : [],
            visa: String(row.visa).toLowerCase() === "yes",
            benefits:
              typeof row.benefits === "string"
                ? row.benefits
                : Array.isArray(row.benefits)
                ? row.benefits.join(",")
                : "",
            skills:
              typeof row.skills === "string"
                ? row.skills
                    .split(",")
                    .map((s: string) => s.trim())
                    .filter(Boolean)
                : [],
            url: row.url || "",
            currency: row.currency || "",
            salaryLow: row.salaryLow || "",
            salaryHigh: row.salaryHigh || "",
            type:
              String(row["type"] ?? row["j/i"]).toLowerCase() ===
                "internship" || String(row["j/i"]).toLowerCase() === "i"
                ? "internship"
                : "job",
            postedAt: Date.now(),
          })
        );

        // filter out any rows missing the six required fields
        const valid = rows.filter(
          (r: ParsedJob) =>
            r.title.trim() !== "" &&
            r.company.trim() !== "" &&
            r.industries.length > 0 &&
            r.skills.length > 0 && // now an array
            r.url.trim() !== "" &&
            r.type
        );

        if (valid.length < rows.length) {
          setCsvError(
            `Skipped ${
              rows.length - valid.length
            } row(s) missing required fields`
          );
        } else {
          setCsvError(null);
        }

        setParsedJobs(valid);
      },
      error: (err: ParseError): void => {
        setCsvError(err.message);
      },
    });
  };

  const uploadCsvJobs = async (): Promise<void> => {
    if (!parsedJobs.length || uploading) return;
    setUploading(true);
    setUploadedCount(0);

    for (const job of parsedJobs) {
      try {
        await fetch("/api/jobs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(job),
        });
        setUploadedCount((c) => c + 1);
      } catch {
        // you can log or track per-row failures here
      }
    }

    setUploading(false);
  };

  return (
    <section className={styles.csvSection}>
      <h2>CSV Bulk Upload</h2>
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
            ? `Uploading… (${uploadedCount}/${parsedJobs.length})`
            : `Upload ${parsedJobs.length} Jobs`}
        </button>
      )}
    </section>
  );
}
