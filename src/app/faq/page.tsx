// src/app/faq/page.tsx
import React from "react";
import styles from "./page.module.css";

const faqs = [
  {
    question: "What is Mayocity?",
    answer:
      "Mayocity is a platform connecting job seekers directly with companies, bypassing traditional recruiters.",
  },
  {
    question: "How do I apply for a job?",
    answer:
      "Simply browse our listings, click on the company link, and submit your application on their site.",
  },
  {
    question: "Can I post my own job opening?",
    answer:
      "Yes—if you’re an employer or hiring manager, use our admin “Post a Job” panel after logging in.",
  },
  {
    question: "Is there a fee to use Mayocity?",
    answer:
      "No—both job seekers and employers can use the core platform features for free.",
  },
  {
    question: "How recent are the listings?",
    answer:
      "All listings show their posting date; we sort newest first and update in real-time from our database.",
  },
];

export default function FAQPage() {
  return (
    <main className={styles.container}>
      <h1>Frequently Asked Questions</h1>
      <ul className={styles.faqList}>
        {faqs.map(({ question, answer }) => (
          <li key={question} className={styles.card}>
            <h2>{question}</h2>
            <p>{answer}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
