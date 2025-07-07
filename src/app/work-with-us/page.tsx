// src/app/work-with-us/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import styles from "./page.module.css";

export default function WorkWithUsPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
    resume: null as File | null,
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    if (name === "resume") {
      setForm((f) => ({ ...f, resume: files?.[0] ?? null }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("email", form.email);
      data.append("message", form.message);
      if (form.resume) data.append("resume", form.resume);

      // replace `/api/work-with-us` with your real endpoint
      const res = await fetch("/api/work-with-us", {
        method: "POST",
        body: data,
      });
      if (!res.ok) throw new Error("Submission failed");
      setStatus("sent");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setStatus("idle");
    }
  };

  if (status === "sent") {
    return (
      <main className={styles.container}>
        <h1>Thank you!</h1>
        <p>We’ve received your information and will be in touch soon.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1>Work With Us</h1>
      <p className={styles.intro}>
        Interested in joining the Mayocity team? Fill out the form below and
        attach your resume. We’ll review your submission and reach out!
      </p>

      {error && <p className={styles.error}>{error}</p>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <label>
          Name
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
          />
        </label>

        <label>
          What are you so good at?
          <textarea
            name="message"
            rows={4}
            value={form.message}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Link to your resume
          <textarea
            name="message"
            rows={2}
            value={form.message}
            onChange={onChange}
            required
          />
        </label>

        {/* <label className={styles.fileInput}>
          Upload Resume
          <input
            type="file"
            name="resume"
            accept=".pdf,.doc,.docx"
            onChange={onChange}
          />
        </label>

        <button
          type="submit"
          disabled={status === "submitting"}
          className={styles.submitBtn}
        >
          {status === "submitting" ? "Sending…" : "Submit"}
        </button> */}
      </form>
    </main>
  );
}
