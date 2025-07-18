/* src/components/ListingCardGlass.tsx */

'use client';

import React from "react";
import FluidGlass from "./effects/FluidGlass";
import { Job } from "./ListingCard"; // same interface as before

interface Props {
  job: Job;
}

/**
 * Glass-bar version of a job-listing card.
 */
export default function ListingCardGlass({ job }: Props) {
  /* ────────── helpers ────────── */
  const href = /^[a-zA-Z][\w+.-]*:\/\//.test(job.url)
    ? job.url
    : `https://${job.url}`;

  const locationText = job.city
    ? `${job.city}${job.country ? `, ${job.country}` : ""}`
    : "";

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    SEK: "kr",
    NZD: "NZ$",
    INR: "₹",
  };

  const symbol = currencySymbols[job.currency] ?? job.currency;
  const hasSalary = job.salaryLow > 0 || job.salaryHigh > 0;
  const salaryText = hasSalary
    ? `${symbol}${job.salaryLow.toLocaleString()} – ${symbol}${job.salaryHigh.toLocaleString()}`
    : "";

  /* ────────── render ────────── */
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        height: "600px",
        marginBottom: "2rem",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      {/* 3-D “bar” glass scene */}
      <FluidGlass
        mode="bar"
        barProps={{
          // tweak these if you want a thicker or more colourful bar
          transmission: 1,
          roughness: 0,
          thickness: 10,
          ior: 1.15,
          color: "#ffffff",
          attenuationColor: "#ffffff",
          attenuationDistance: 0.25,
        }}
      />

      {/* Overlay text sits above the bar */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          textAlign: "center",
          color: "#ffffff",
          width: "80%",
          pointerEvents: "none",
          textShadow: "0 2px 6px rgba(0,0,0,0.45)",
        }}
      >
        <h2
          style={{ margin: "0 0 0.25rem", fontSize: "2rem", lineHeight: 1.2 }}
        >
          {job.title}
        </h2>
        <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: 500 }}>
          {job.company}
        </p>

        {locationText && (
          <p style={{ margin: "0.5rem 0 0", fontSize: "0.95rem" }}>
            {locationText}
          </p>
        )}

        {hasSalary && (
          <p
            style={{
              margin: "0.75rem 0 0",
              fontSize: "1.05rem",
              fontWeight: 600,
            }}
          >
            {salaryText}
          </p>
        )}
      </div>
    </a>
  );
}
