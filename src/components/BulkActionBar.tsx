"use client";

import React from "react";
import styles from "./BulkActionBar.module.css";

interface Props {
  /** number of selected rows */
  count: number;
  /** called when *all* selected rows should be (re-)posted */
  onPostAll?: () => void | Promise<void>;
  /** called when all selected rows should be deleted */
  onDeleteAll: () => void | Promise<void>;
  /** called when Gemini review should run on all selected rows */
  onReviewAll?: () => void | Promise<void>;
  /** disable all buttons + show progress */
  disabled?: boolean;
  /** current progress (0 – total) */
  progress?: number;
  /** total rows in the batch */
  total?: number;
  /** hide the “Post Selected” button (defaults to false) */
  showPost?: boolean;
  showReview?: boolean;
  postButtonText?: string;
}

export default function BulkActionBar({
  count,
  onPostAll,
  onDeleteAll,
  onReviewAll,
  disabled = false,
  progress = 0,
  total = 0,
  showPost = true,
  showReview = true,
  postButtonText = `Post Selected (${count})`,
}: Props) {
  return (
    <div className={styles.bar}>
      {showPost && onPostAll && (
        <button
          className={`${styles.button} ${styles.primary}`}
          onClick={onPostAll}
          disabled={disabled}
        >
          {/* This now uses your custom text prop */}
          {postButtonText}
        </button>
      )}

      <button
        className={`${styles.button} ${styles.delete}`}
        onClick={onDeleteAll}
        disabled={disabled}
      >
        Delete&nbsp;Selected&nbsp;({count})
      </button>

      {/* This button is now hidden when showReview is false */}
      {showReview && onReviewAll && (
        <button
          className={`${styles.button} ${styles.review}`}
          onClick={onReviewAll}
          disabled={disabled}
        >
          Gemini&nbsp;Review&nbsp;Selected&nbsp;({count})
        </button>
      )}

      {disabled && total > 0 && (
        <div className={styles.progressWrapper}>
          <progress className={styles.progress} value={progress} max={total} />
          <span className={styles.progressText}>
            {progress}/{total}
          </span>
        </div>
      )}
    </div>
  );
}
