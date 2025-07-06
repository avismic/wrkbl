// src/components/JobForm/JobForm.tsx
"use client";
import React, { ChangeEvent } from "react";
import css from "./JobForm.module.css";
import { useJobForm, JobDraft } from "./useJobForm";
import { industryOptions, benefitOptions, currencyOptions } from "./options";

interface Props {
  initial?: Partial<JobDraft>;
  onSubmit: (payload: any) => Promise<void> | void;
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

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    onField(name as any, type === "checkbox" ? checked : value);
    if (name === "experienceLevel")
      onField("type", value === "Intern" ? "internship" : "");
  };

  return (
    <>
      <div className={css.formGrid}>
        {/* Row 1 */}
        <input name="title"   placeholder="Title"   value={form.title}   onChange={onChange}/>
        <input name="company" placeholder="Company" value={form.company} onChange={onChange}/>

        {/* Row 2 */}
        <input name="city"    placeholder="City"    value={form.city}    onChange={onChange}/>
        <input name="country" placeholder="Country" value={form.country} onChange={onChange}/>

        {/* Row 3 */}
        <select name="officeType" value={form.officeType} onChange={onChange}>
          <option value="" disabled>Location Type (Select one)</option>
          <option>Remote</option><option>Hybrid</option>
          <option>In-Office</option><option>Remote-Anywhere</option>
        </select>

        <select name="experienceLevel" value={form.experienceLevel} onChange={onChange}>
          <option value="" disabled>Select Experience Level</option>
          <option>Intern</option><option>Entry-level</option>
          <option>Associate/Mid-level</option><option>Senior-level</option>
          <option>Managerial</option><option>Executive</option>
        </select>

        <select name="employmentType" value={form.employmentType} onChange={onChange}>
          <option value="" disabled>Select Employment Type</option>
          <option>Full-time</option><option>Part-time</option>
          <option>Contract</option><option>Temporary</option><option>Freelance</option>
        </select>

        {/* Industries */}
        <div style={{ gridColumn:"1 / span 2" }}>
          <p style={{margin:0}}>Industry (up to 3):</p>
          <div className={css.checkboxGroup}>
            {industryOptions.map(opt => (
              <label key={opt}>
                <input type="checkbox"
                       checked={form.industries.includes(opt)}
                       onChange={() => toggleArr("industries", opt)}/> {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Visa */}
        <label style={{ gridColumn:"1 / span 2" }}>
          <input type="checkbox" name="visa" checked={form.visa} onChange={onChange}/> Visa Sponsorship Available
        </label>

        {/* Benefits */}
        <div style={{ gridColumn:"1 / span 2" }}>
          <p style={{margin:0}}>Benefits:</p>
          <div className={css.checkboxGroup}>
            {benefitOptions.map(b => (
              <label key={b}>
                <input type="checkbox"
                       checked={form.benefits.includes(b)}
                       onChange={() => toggleArr("benefits", b)}/> {b}
              </label>
            ))}
          </div>
        </div>

        {/* Skills & URL */}
        <input name="skills" placeholder="Skills (comma-separated)"
               value={form.skills} onChange={onChange} style={{gridColumn:"1 / span 2"}}/>
        <input name="url" placeholder="Application URL"
               value={form.url} onChange={onChange} style={{gridColumn:"1 / span 2"}}/>

        {/* Currency & salary */}
        <select name="currency" value={form.currency} onChange={onChange}>
          <option value="" disabled>Choose currency</option>
          {currencyOptions.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
        </select>
        <div className={css.salaryRow}>
          <input name="salaryLow"  placeholder="Low"  value={form.salaryLow}  onChange={onChange} style={{flex:1}}/>
          <span>–</span>
          <input name="salaryHigh" placeholder="High" value={form.salaryHigh} onChange={onChange} style={{flex:1}}/>
        </div>

        {/* Opportunity type */}
        {form.experienceLevel !== "Intern" && (
          <select className={css.fullWidth} name="type" value={form.type} onChange={onChange}>
            <option value="" disabled>Choose opportunity type</option>
            <option value="job">Job</option><option value="internship">Internship</option>
          </select>
        )}
      </div>

      {/* buttons */}
      <div className={css.editActions}>
        <button className={`${css.button} ${css.primary}`}
                disabled={loading}
                onClick={() => onSubmit(toPayload())}>
          {loading ? "Saving…" : editMode ? "Save Changes" : "Add Job"}
        </button>
        {onCancel && (
          <button className={`${css.button} ${css.logout}`}
                  disabled={loading} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </>
  );
}
