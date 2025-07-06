// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

// Define the shape of a row returned from the database
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

export async function GET() {
  const pool = await openDb();
  const { rows } = await pool.query<JobRow>(`
    SELECT
      id,
      title,
      company,
      city,
      country,
      "officeType",
      "experienceLevel",
      "employmentType",
      industry,
      visa,
      benefits,
      skills,
      url,
      "postedAt",
      remote,
      type,
      "salaryLow",
      "salaryHigh",
      currency
    FROM jobs
    ORDER BY "postedAt" DESC
  `);

  const payload = rows.map((r: JobRow) => ({
    id: r.id,
    title: r.title,
    company: r.company,
    // legacy `location` for backwards‐compatibility
    location: `${r.city} – ${r.country}`,
    city: r.city,
    country: r.country,
    officeType: r.officeType,
    experienceLevel: r.experienceLevel,
    employmentType: r.employmentType,

    // === NEW: return as an array ===
    industries: r.industry
      ? r.industry.split(",").map((s: string) => s.trim())
      : [],

    visa: Boolean(r.visa),
    benefits: r.benefits.split(",").map((b: string) => b.trim()),
    skills: r.skills.split(",").map((s: string) => s.trim()),
    url: r.url,
    postedAt: r.postedAt,
    remote: Boolean(r.remote),
    type: r.type === "i" ? "internship" : "job",
    salaryLow: r.salaryLow,
    salaryHigh: r.salaryHigh,
    currency: r.currency,
  }));

  return NextResponse.json(payload);
}

export async function POST(req: NextRequest) {
  const jobsToInsert = (await req.json()) as Array<{
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
    visa: boolean;
    benefits: string;
    skills: string[];
    url: string;
    postedAt: number;
    remote: boolean;
    type: "j" | "i";
    salaryLow: number;
    salaryHigh: number;
    currency: string;
  }>;

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
    ON CONFLICT (id) DO UPDATE SET
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
      url              = EXCLUDED.url,
      "postedAt"         = EXCLUDED."postedAt",
      remote           = EXCLUDED.remote,
      type             = EXCLUDED.type,
      "salaryLow"        = EXCLUDED."salaryLow",
      "salaryHigh"       = EXCLUDED."salaryHigh",
      currency         = EXCLUDED.currency
  `;

  for (const job of jobsToInsert) {
    const industryValue = Array.isArray(job.industries)
      ? job.industries.join(",")
      : typeof job.industries === "string"
      ? job.industries
      : job.industry ?? "";

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
      job.visa,
      job.benefits,
      job.skills.join(","),
      job.url,
      job.postedAt,
      job.remote,
      job.type,
      job.salaryLow,
      job.salaryHigh,
      job.currency,
    ] as const;

    await pool.query(sql, values);
  }

  return NextResponse.json({ success: true, count: jobsToInsert.length });
}
