// src/app/post-a-job/page.tsx
"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./page.module.css";

export default function PostAJobPage() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    skills: "",
    url: "",
    remote: false,
    type: "job" as "job" | "internship",
    currency: "$",
    salaryLow: "",
    salaryHigh: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const payload = {
      id: uuidv4().slice(0, 4) + "-" + Math.floor(100 + Math.random() * 900),
      title: form.title,
      company: form.company,
      location: form.location,
      skills: form.skills.split(",").map((s) => s.trim()),
      url: form.url,
      postedAt: Date.now(),
      remote: form.remote,
      type: form.type,
      currency: form.currency,
      salaryLow: parseInt(form.salaryLow, 10) || 0,
      salaryHigh: parseInt(form.salaryHigh, 10) || 0,
    };

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Status ${res.status}`);
      setStatus("sent");
    } catch (err: any) {
      setError(err.message || "Failed to submit");
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
    <div className={styles.container}>
      <h1>Post a Job Request</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          required
        />
        <input
          name="location"
          placeholder="Location (e.g. Bangalore – India)"
          value={form.location}
          onChange={handleChange}
          required
        />
        <label className={styles.checkbox}>
          <input
            name="remote"
            type="checkbox"
            checked={form.remote}
            onChange={handleChange}
          />{" "}
          Remote
        </label>
        <select name="type" value={form.type} onChange={handleChange} required>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
        </select>
        <input
          name="skills"
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={handleChange}
          required
        />
        <input
          name="url"
          placeholder="URL"
          value={form.url}
          onChange={handleChange}
          required
        />
        <input
          name="currency"
          placeholder="Currency"
          value={form.currency}
          onChange={handleChange}
          required
        />
        <div className={styles.salaryRow}>
          <input
            name="salaryLow"
            placeholder="Salary Low"
            value={form.salaryLow}
            onChange={handleChange}
          />
          <span>–</span>
          <input
            name="salaryHigh"
            placeholder="Salary High"
            value={form.salaryHigh}
            onChange={handleChange}
          />
        </div>
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
