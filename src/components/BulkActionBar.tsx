"use client";

import React from "react";
import styles from "./BulkActionBar.module.css";

interface Props {
  count: number;
  onPostAll: () => void;
  onDeleteAll: () => void;
  onReviewAll: () => void;
  disabled?: boolean;
  progress?: number;
  total?: number;
}

export default function BulkActionBar({
  count,
  onPostAll,
  onDeleteAll,
  onReviewAll,
  disabled = false,
  progress = 0,
  total = 0,
}: Props) {
  return (
    <div className={styles.bar}>
      <button
        className={`${styles.button} ${styles.primary}`}
        onClick={onPostAll}
        disabled={disabled}
      >
        Post Selected ({count})
      </button>
      <button
        className={`${styles.button} ${styles.delete}`}
        onClick={onDeleteAll}
        disabled={disabled}
      >
        Delete Selected ({count})
      </button>
      <button
        className={`${styles.button} ${styles.review}`}
        onClick={onReviewAll}
        disabled={disabled}
      >
        Gemini Review Selected ({count})
      </button>

      {disabled && total > 0 && (
        <div className={styles.progressWrapper}>
          <progress
            className={styles.progress}
            value={progress}
            max={total}
          />
          <span className={styles.progressText}>
            {progress}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
