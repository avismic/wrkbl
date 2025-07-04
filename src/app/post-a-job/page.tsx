// src/app/post-a-job/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import styles from "./page.module.css";

type OfficeType = "Remote" | "Hybrid" | "In-Office" | "Remote-Anywhere";
type ExperienceLevel =
  | "Intern"
  | "Entry-level"
  | "Associate/Mid-level"
  | "Senior-level"
  | "Managerial"
  | "Executive";
type EmploymentType =
  | "Full-time"
  | "Part-time"
  | "Contract"
  | "Temporary"
  | "Freelance";

export default function PostAJobPage() {
  const [form, setForm] = useState({
    title: "",
    company: "",
    city: "",
    country: "",
    officeType: "Remote" as OfficeType,
    experienceLevel: "Intern" as ExperienceLevel,
    employmentType: "Full-time" as EmploymentType,
    industry: "",
    visa: false,
    benefits: ["Health insurance"] as string[],
    skills: "",
    url: "",
    currency: "$",
    salaryLow: "",
    salaryHigh: "",
    type: "job" as "job" | "internship",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked, multiple, options } = e.target as any;
    if (type === "checkbox" && name === "visa") {
      setForm((f) => ({ ...f, visa: checked }));
    } else if (multiple && name === "benefits") {
      const selected = Array.from(options)
        .filter((o: HTMLOptionElement) => o.selected)
        .map((o: HTMLOptionElement) => o.value);
      setForm((f) => ({ ...f, benefits: selected }));
    } else {
      setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const payload = {
      id: uuidv4().slice(0, 4) + "-" + Math.floor(100 + Math.random() * 900),
      title: form.title,
      company: form.company,
      city: form.city,
      country: form.country,
      officeType: form.officeType,
      experienceLevel: form.experienceLevel,
      employmentType: form.employmentType,
      industry: form.industry,
      visa: form.visa,
      benefits: form.benefits,
      skills: form.skills.split(",").map((s) => s.trim()),
      url: form.url,
      postedAt: Date.now(),
      remote: form.officeType.toLowerCase().includes("remote"),
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
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
        />
        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
          required
        />

        <select
          name="officeType"
          value={form.officeType}
          onChange={handleChange}
        >
          <option>Remote</option>
          <option>Hybrid</option>
          <option>In-Office</option>
          <option>Remote-Anywhere</option>
        </select>

        <select
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={handleChange}
        >
          <option>Intern</option>
          <option>Entry-level</option>
          <option>Associate/Mid-level</option>
          <option>Senior-level</option>
          <option>Managerial</option>
          <option>Executive</option>
        </select>

        <select
          name="employmentType"
          value={form.employmentType}
          onChange={handleChange}
        >
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Contract</option>
          <option>Temporary</option>
          <option>Freelance</option>
        </select>

        <input
          name="industry"
          placeholder="Industry / Job Sector"
          value={form.industry}
          onChange={handleChange}
        />

        <label className={styles.checkbox}>
          <input
            name="visa"
            type="checkbox"
            checked={form.visa}
            onChange={handleChange}
          />
          Visa Sponsorship Available
        </label>

        <select
          name="benefits"
          multiple
          value={form.benefits}
          onChange={handleChange}
        >
          <option>Health insurance</option>
          <option>Paid leave</option>
          <option>Flexible working hours</option>
          <option>Stock options</option>
        </select>

        <input
          name="skills"
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={handleChange}
        />

        <input
          name="url"
          placeholder="URL"
          value={form.url}
          onChange={handleChange}
        />

        <input
          name="currency"
          placeholder="Currency"
          value={form.currency}
          onChange={handleChange}
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

        <select name="type" value={form.type} onChange={handleChange} required>
          <option value="job">Job</option>
          <option value="internship">Internship</option>
        </select>

        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending…" : "Submit Request"}
        </button>
      </form>
    </div>
  );
}
