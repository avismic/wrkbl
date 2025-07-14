// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

/* ── DB row shape ── */
interface JobRow {
  id: string;
  title: string;
  company: string;
  city: string;
  country: string;
  officeType: string;
  experienceLevel: string;
  employmentType: string;
  industry: string | null;
  visa: number;
  benefits: string;
  skills: string;
  url: string;
  postedAt: number;
  remote: number;
  type: "j" | "i";
  salaryLow: number;
  salaryHigh: number;
  currency: string;
}

/* ─────────────────── GET ─────────────────── */

export async function GET(): Promise<NextResponse> {
  const pool = await openDb();
  const { rows } = await pool.query<JobRow>(`
    SELECT
      id, title, company, city, country,
      "officeType", "experienceLevel", "employmentType",
      industry, visa, benefits, skills, url,
      "postedAt", remote, type, "salaryLow", "salaryHigh", currency
    FROM jobs
    ORDER BY "postedAt" DESC
  `);

  const payload = rows.map((r: JobRow) => ({
    id: r.id,
    title: r.title,
    company: r.company,
    location: `${r.city} – ${r.country}`,
    city: r.city,
    country: r.country,
    officeType: r.officeType,
    experienceLevel: r.experienceLevel,
    employmentType: r.employmentType,
    industries: r.industry
      ? r.industry.split(",").map((s: string) => s.trim())
      : [],
    visa: Boolean(r.visa),
    benefits: r.benefits.split(",").map((b: string) => b.trim()),
    skills: r.skills.split(",").map((s: string) => s.trim()),
    url: r.url,
    postedAt: Number(r.postedAt),
    remote: Boolean(r.remote),
    type: r.type === "i" ? "internship" : "job",
    salaryLow: r.salaryLow,
    salaryHigh: r.salaryHigh,
    currency: r.currency,
  }));

  return NextResponse.json(payload);
}

/* ─────────────────── POST ─────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const jobsToInsert: Array<{
    id: string;
    title: string;
    company: string;
    city: string;
    country: string;
    officeType: string;
    experienceLevel: string;
    employmentType: string;
    industry?: string;
    industries?: string[] | string;
    visa: boolean | string; // allow string because CSV may send "true"/"false"
    benefits: string;
    skills: string[] | string; // allow string for CSV one-liner
    url: string;
    postedAt: number | string;
    remote: boolean | string;
    type: "j" | "i";
    salaryLow: number | string; // ★ widen to string
    salaryHigh: number | string; // ★ widen to string
    currency: string;
  }> = Array.isArray(body) ? body : [body];

  /* 1) validate */
  for (const job of jobsToInsert) {
    const hasIndustry = Array.isArray(job.industries)
      ? job.industries.length > 0
      : typeof job.industries === "string"
      ? job.industries.trim() !== ""
      : job.industry?.trim() !== "";

    if (
      !job.title?.trim() ||
      !job.company?.trim() ||
      !hasIndustry ||
      (!Array.isArray(job.skills) &&
        !(typeof job.skills === "string" && job.skills.trim() !== "")) ||
      (Array.isArray(job.skills) && job.skills.length === 0) ||
      !job.url?.trim() ||
      !job.type
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          jobId: job.id,
        },
        { status: 400 }
      );
    }
  }

  /* 2) upsert */
  const pool = await openDb();
  const sql = `
    INSERT INTO jobs (
      id, title, company,
      city, country,
      "officeType", "experienceLevel", "employmentType", industry,
      visa, benefits,
      skills, url, "postedAt",
      remote, type, "salaryLow", "salaryHigh", currency
    ) VALUES (
      $1, $2, $3,
      $4, $5,
      $6, $7, $8, $9,
      $10, $11,
      $12, $13, $14,
      $15, $16, $17, $18, $19
    )
    ON CONFLICT (url) DO UPDATE SET
      title            = EXCLUDED.title,
      company          = EXCLUDED.company,
      city             = EXCLUDED.city,
      country          = EXCLUDED.country,
      "officeType"       = EXCLUDED."officeType",
      "experienceLevel"  = EXCLUDED."experienceLevel",
      "employmentType"   = EXCLUDED."employmentType",
      industry         = EXCLUDED.industry,
      visa             = EXCLUDED.visa,
      benefits         = EXCLUDED.benefits,
      skills           = EXCLUDED.skills,
      "postedAt"         = EXCLUDED."postedAt",
      remote           = EXCLUDED.remote,
      type             = EXCLUDED.type,
      "salaryLow"        = EXCLUDED."salaryLow",
      "salaryHigh"       = EXCLUDED."salaryHigh",
      currency         = EXCLUDED.currency
  `;

  for (const job of jobsToInsert) {
    /* ★ SAFELY PARSE numeric fields */
    const salaryLowInt = parseInt(String(job.salaryLow || ""), 10) || 0;
    const salaryHighInt = parseInt(String(job.salaryHigh || ""), 10) || 0;
    const postedAtInt = parseInt(String(job.postedAt || ""), 10) || Date.now();

    const industryValue = Array.isArray(job.industries)
      ? job.industries.join(",")
      : typeof job.industries === "string"
      ? job.industries
      : job.industry ?? "";

    const skillsValue = Array.isArray(job.skills)
      ? job.skills.join(",")
      : job.skills;

    const values = [
      job.id,
      job.title,
      job.company,
      job.city,
      job.country,
      job.officeType,
      job.experienceLevel,
      job.employmentType,
      industryValue,
      job.visa === true || job.visa === "true" ? 1 : 0,
      job.benefits,
      skillsValue,
      job.url,
      postedAtInt,
      job.remote === true || job.remote === "true" ? 1 : 0,
      job.type,
      salaryLowInt, // ★ int, never ""
      salaryHighInt, // ★ int, never ""
      job.currency,
    ] as const;

    await pool.query(sql, values);
  }

  return NextResponse.json({ success: true, count: jobsToInsert.length });
}
