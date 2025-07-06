// src/components/JobForm/useJobForm.ts
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export interface JobDraft {
  id?: string;
  title: string;
  company: string;
  city: string;
  country: string;
  officeType: string;
  experienceLevel: string;
  employmentType: string;
  industries: string[];
  visa: boolean;
  benefits: string[];
  skills: string;            // comma-separated string in UI
  url: string;
  currency: string;
  salaryLow: string;
  salaryHigh: string;
  type: "job" | "internship" | "";
}

export const emptyJob: JobDraft = {
  title: "", company: "", city: "", country: "",
  officeType: "", experienceLevel: "", employmentType: "",
  industries: [], visa: false, benefits: [],
  skills: "", url: "", currency: "",
  salaryLow: "", salaryHigh: "", type: ""
};

export function useJobForm(initial: Partial<JobDraft> = {}) {
  /* turn possible array→string fields into UI format */
  const norm: Partial<JobDraft> = {
    ...initial,
    skills: Array.isArray(initial.skills)
      ? (initial.skills as string[]).join(", ")
      : (initial.skills ?? ""),
  };

  const [form, setForm] = useState<JobDraft>({ ...emptyJob, ...norm });

  const onField = (name: keyof JobDraft, value: string | boolean) =>
    setForm(f => ({ ...f, [name]: value }) as JobDraft);

  const toggleArr = (
    key: "industries" | "benefits",
    val: string,
    max = 3
  ) => setForm(f => {
    const next = new Set(f[key]);
    next.has(val) ? next.delete(val) : next.add(val);
    if (key === "industries" && next.size > max) return f;
    return { ...f, [key]: Array.from(next) } as JobDraft;
  });

  const toPayload = () => ({
    id: form.id ?? uuidv4().slice(0,4)+"-"+Math.floor(100+Math.random()*900),
    title: form.title,
    company: form.company,
    city: form.city,
    country: form.country,
    officeType: form.officeType,
    experienceLevel: form.experienceLevel,
    employmentType: form.employmentType,
    industries: form.industries,
    visa: form.visa,
    benefits: form.benefits,
    skills: form.skills.split(",").map(s=>s.trim()).filter(Boolean),
    url: form.url,
    currency: form.currency,
    salaryLow:  parseInt(form.salaryLow,10) || 0,
    salaryHigh: parseInt(form.salaryHigh,10) || 0,
    postedAt:   Date.now(),
    remote: form.officeType.toLowerCase().includes("remote"),
    type:   form.type === "internship" ? "internship" : "job"
  });

  return { form, onField, toggleArr, toPayload };
}
