// src/components/TrashButton.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import styles from "./TrashButton.module.css";

export default function TrashButton({ count = 0 }: { count: number }) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/trash")}
      className={`${styles.button} ${styles.trash}`}
    >
      Trash
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
