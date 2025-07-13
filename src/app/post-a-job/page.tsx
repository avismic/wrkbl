// src/app/post-a-job/page.tsx
"use client";

import React, { useState } from "react";
import CsvUploadPanel from "@/components/CsvUploadPanel";
import JobForm from "@/components/JobForm/JobForm";
import styles from "./page.module.css";

export default function PostAJobPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (payload: any) => {
    setStatus("sending");
    setError(null);
    try {
      await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <div className={styles.thanks}>
        <h1>Thank you!</h1>
        <p>Your job request has been sent. The admin will review it shortly.</p>
      </div>
    );
  }

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Post a Job Request</h1>
      <CsvUploadPanel />
      {error && <p className={styles.error}>{error}</p>}
      <JobForm onSubmit={handleSubmit} loading={status === "sending"} />
    </main>
  );
}
