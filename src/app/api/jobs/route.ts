// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

// shape of a row returned from the database
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

export async function GET(): Promise<NextResponse> {
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

export async function POST(req: NextRequest): Promise<NextResponse> {
  // parse and normalize payload to array
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
  }> = Array.isArray(body) ? body : [body];

  // 1) validate required fields
  for (const job of jobsToInsert) {
    const hasIndustry: boolean = Array.isArray(job.industries)
      ? job.industries.length > 0
      : typeof job.industries === "string"
      ? job.industries.trim() !== ""
      : job.industry?.trim() !== "";
    if (
      !job.title?.trim() ||
      !job.company?.trim() ||
      !hasIndustry ||
      !Array.isArray(job.skills) ||
      job.skills.length === 0 ||
      !job.url?.trim() ||
      !job.type
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          missing: {
            title: !job.title?.trim(),
            company: !job.company?.trim(),
            industry: !hasIndustry,
            skills: !(Array.isArray(job.skills) && job.skills.length > 0),
            url: !job.url?.trim(),
            type: !job.type,
          },
          jobId: job.id,
        },
        { status: 400 }
      );
    }
  }

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
      url              = EXCLUDED.url,
      "postedAt"         = EXCLUDED."postedAt",
      remote           = EXCLUDED.remote,
      type             = EXCLUDED.type,
      "salaryLow"        = EXCLUDED."salaryLow",
      "salaryHigh"       = EXCLUDED."salaryHigh",
      currency         = EXCLUDED.currency
  `;

  // 2) upsert each job
  for (const job of jobsToInsert) {
    const industryValue: string = Array.isArray(job.industries)
      ? job.industries.join(",")
      : typeof job.industries === "string"
      ? job.industries
      : job.industry ?? "";

    const skillsValue: string = job.skills.join(",");

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
      job.visa ? 1 : 0,
      job.benefits,
      skillsValue,
      job.url,
      job.postedAt,
      job.remote ? 1 : 0,
      job.type,
      job.salaryLow,
      job.salaryHigh,
      job.currency,
    ] as const;

    await pool.query(sql, values);
  }

  return NextResponse.json({ success: true, count: jobsToInsert.length });
}
