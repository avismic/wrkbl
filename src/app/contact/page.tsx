// src/app/contact/page.tsx
"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import styles from "./page.module.css";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send");
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
        <p>Your message has been sent. We’ll get back to you shortly.</p>
      </main>
    );
  }

  return (
    <main className={styles.container}>
      <h1>Contact Us</h1>
      <p className={styles.intro}>
        Have questions or feedback? Fill out the form below and we’ll respond as soon as possible.
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
          Subject
          <input
            type="text"
            name="subject"
            value={form.subject}
            onChange={onChange}
            required
          />
        </label>

        <label>
          Message
          <textarea
            name="message"
            rows={5}
            value={form.message}
            onChange={onChange}
            required
          />
        </label>

        <button
          type="submit"
          disabled={status === "sending"}
          className={styles.submitBtn}
        >
          {status === "sending" ? "Sending…" : "Send Message"}
        </button>
      </form>
    </main>
  );
}
