// src/app/faq/page.tsx
import React from "react";
import styles from "./page.module.css";

const faqs = [
  {
    question: "How do I apply for a job?",
    answer: "Click the “Apply Now” button on any listing to be taken to the employer’s site.",
  },
  {
    question: "Can I post a job request?",
    answer: "Yes—use the “Post a Job” page to submit a request; admins will review and publish it.",
  },
  {
    question: "How often are listings updated?",
    answer: "We fetch and refresh our database daily, but always check the posting date on each listing.",
  },
  {
    question: "Who do I contact for support?",
    answer: "Reach out via our Contact Us page or email support@mayocity.com.",
  },
];

export default function FAQPage() {
  return (
    <main className={styles.container}>
      <h1>Frequently Asked Questions</h1>
      <dl className={styles.faqList}>
        {faqs.map((item, i) => (
          <React.Fragment key={i}>
            <dt className={styles.question}>{item.question}</dt>
            <dd className={styles.answer}>{item.answer}</dd>
          </React.Fragment>
        ))}
      </dl>
    </main>
  );
}

