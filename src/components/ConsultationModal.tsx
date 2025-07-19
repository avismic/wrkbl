// src/components/ConsultationModal.tsx

"use client";

import React, { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./ConsultationModal.module.css";

interface ConsultationModalProps {
  onClose: () => void;
}

export default function ConsultationModal({ onClose }: ConsultationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.company) {
      setError("Please fill out all required fields.");
      setStatus("error");
      return;
    }

    try {
      // NOTE: You would create this API endpoint to handle the form submission
      // For now, we'll simulate a successful submission.
      console.log("Submitting form data:", formData);
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      // const response = await fetch('/api/consultation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });
      // if (!response.ok) throw new Error('Something went wrong.');

      setStatus("sent");
    } catch (err) {
      setError("Failed to send message. Please try again later.");
      setStatus("error");
    }
  };

  return (
    <motion.div
      className={styles.backdrop}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ y: "-50px", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "50px", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <button className={styles.closeButton} onClick={onClose}>
          &times;
        </button>

        {status === "sent" ? (
          <div className={styles.successMessage}>
            <h2>Thank You!</h2>
            <p>Your consultation request has been sent. We'll be in touch shortly.</p>
          </div>
        ) : (
          <>
            <h2>Book a Consultation</h2>
            <p className={styles.intro}>
              Let's build your talent engine. Tell us a bit about your company and needs.
            </p>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
                <input
                  type="text"
                  name="company"
                  placeholder="Company Name"
                  value={formData.company}
                  onChange={handleChange}
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Work Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <textarea
                name="message"
                placeholder="Tell us about your hiring goals..."
                value={formData.message}
                onChange={handleChange}
                rows={4}
              />
              <button
                type="submit"
                className={styles.submitButton}
                disabled={status === "sending"}
              >
                {status === "sending" ? "Sending..." : "Submit Request"}
              </button>
              {status === "error" && <p className={styles.error}>{error}</p>}
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
