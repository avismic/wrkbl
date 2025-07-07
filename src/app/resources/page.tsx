// src/app/resources/page.tsx
import React from "react";
import styles from "./page.module.css";

const resources = [
  {
    title: "Developer Documentation",
    url: "https://docs.mayocity.com",
    description: "Full API reference and developer guides.",
  },
  {
    title: "Blog",
    url: "https://blog.mayocity.com",
    description: "Latest articles, tutorials, and news.",
  },
  {
    title: "Community Forum",
    url: "https://community.mayocity.com",
    description: "Ask questions and discuss with other users.",
  },
  {
    title: "FAQ",
    url: "/faq",
    description: "Frequently asked questions and answers.",
  },
];

export default function ResourcesPage() {
  return (
    <main className={styles.container}>
      <h1>Resources</h1>
      <p className={styles.intro}>
        Here are some helpful links to get you started.
      </p>
      <ul className={styles.list}>
        {resources.map((res) => (
          <li key={res.title} className={styles.item}>
            <a href={res.url} target="_blank" rel="noopener noreferrer">
              <h2>{res.title}</h2>
              <p>{res.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
