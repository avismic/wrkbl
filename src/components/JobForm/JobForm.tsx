// src/components/JobForm/JobForm.tsx
"use client";

import React, { ChangeEvent } from "react";
import css from "./JobForm.module.css";
import { useJobForm, JobDraft } from "./useJobForm";
import { industryOptions, benefitOptions, currencyOptions } from "./options";

interface Props {
  initial?: Partial<JobDraft>;
  onSubmit: (payload: any) => void | Promise<void>; // loosened to avoid typeof issues
  onCancel?: () => void;
  editMode?: boolean;
  loading?: boolean;
}

export default function JobForm({
  initial,
  onSubmit,
  onCancel,
  editMode = false,
  loading = false,
}: Props) {
  const { form, onField, toggleArr, toPayload } = useJobForm(initial);

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.currentTarget;
    const checked: boolean =
      type === "checkbox" ? (e.currentTarget as HTMLInputElement).checked : false;
    onField(
      name as keyof JobDraft,
      type === "checkbox" ? checked : value
    );

    if (name === "experienceLevel") {
      onField("type", value === "Intern" ? "internship" : "");
    }
  };

  return (
    <>
      <div className={css.formGrid}>
        {/* Row 1 */}
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={onChange}
          required
        />
        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={onChange}
          required
        />

        {/* Row 2 */}
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={onChange}
        />
        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={onChange}
        />

        {/* Row 3 */}
        <select
          name="officeType"
          value={form.officeType}
          onChange={onChange}
          required
        >
          <option value="" disabled>
            Location Type (Select one)
          </option>
          <option>Remote</option>
          <option>Hybrid</option>
          <option>In-Office</option>
          <option>Remote-Anywhere</option>
        </select>

        <select
          name="experienceLevel"
          value={form.experienceLevel}
          onChange={onChange}
          required
        >
          <option value="" disabled>
            Select Experience Level
          </option>
          {[
            "Intern",
            "Entry-level",
            "Associate/Mid-level",
            "Senior-level",
            "Managerial",
            "Executive",
          ].map((lvl: string) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>

        <select
          name="employmentType"
          value={form.employmentType}
          onChange={onChange}
          required
        >
          <option value="" disabled>
            Select Employment Type
          </option>
          {[
            "Full-time",
            "Part-time",
            "Contract",
            "Temporary",
            "Freelance",
          ].map((et: string) => (
            <option key={et} value={et}>
              {et}
            </option>
          ))}
        </select>

        {/* Industry (require at least one) */}
        <div style={{ gridColumn: "1 / span 2" }}>
          <p style={{ margin: 0 }}>Industry (up to 3):</p>
          <div className={css.checkboxGroup}>
            {industryOptions.map((opt: string, idx: number) => (
              <label key={opt}>
                <input
                  type="checkbox"
                  name="industries"
                  checked={form.industries.includes(opt)}
                  onChange={(): void => toggleArr("industries", opt)}
                  {...(idx === 0 ? { required: true } : {})}
                />{" "}
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Visa */}
        <label style={{ gridColumn: "1 / span 2" }}>
          <input
            type="checkbox"
            name="visa"
            checked={form.visa}
            onChange={onChange}
          />{" "}
          Visa Sponsorship Available
        </label>

        {/* Benefits */}
        <div style={{ gridColumn: "1 / span 2" }}>
          <p style={{ margin: 0 }}>Benefits:</p>
          <div className={css.checkboxGroup}>
            {benefitOptions.map((b: string) => (
              <label key={b}>
                <input
                  type="checkbox"
                  checked={form.benefits.includes(b)}
                  onChange={(): void => toggleArr("benefits", b)}
                />{" "}
                {b}
              </label>
            ))}
          </div>
        </div>

        {/* Skills & URL */}
        <input
          name="skills"
          placeholder="Skills (comma-separated)"
          value={form.skills}
          onChange={onChange}
          required
        />
        <input
          name="url"
          placeholder="Application URL"
          value={form.url}
          onChange={onChange}
          required
        />

        {/* Currency & Salary */}
        <select
          name="currency"
          value={form.currency}
          onChange={onChange}
          required
        >
          <option value="" disabled>
            Choose currency
          </option>
          {currencyOptions.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <div className={css.salaryRow}>
          <input
            name="salaryLow"
            placeholder="Low"
            value={form.salaryLow}
            onChange={onChange}
          />
          <span>–</span>
          <input
            name="salaryHigh"
            placeholder="High"
            value={form.salaryHigh}
            onChange={onChange}
          />
        </div>

        {/* Opportunity type */}
        {form.experienceLevel !== "Intern" && (
          <select
            name="type"
            value={form.type}
            onChange={onChange}
            required
          >
            <option value="" disabled>
              Choose opportunity type
            </option>
            <option value="job">Job</option>
            <option value="internship">Internship</option>
          </select>
        )}
      </div>

      <div className={css.editActions}>
        <button
          className={`${css.button} ${css.primary}`}
          disabled={loading}
          onClick={(): void => {
            onSubmit(toPayload());
          }}
        >
          {loading ? "Saving…" : editMode ? "Save Changes" : "Add Job"}
        </button>
        {onCancel && (
          <button
            className={`${css.button} ${css.logout}`}
            disabled={loading}
            onClick={(): void => {
              onCancel();
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </>
  );
}
