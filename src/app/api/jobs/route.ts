// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function GET() {
  const db = await openDb();
  const rows: any[] = await db.all(`
    SELECT
      id,
      title,
      company,
      city,
      country,
      officeType,
      experienceLevel,
      employmentType,
      industry,
      visa,
      benefits,
      skills,
      url,
      postedAt,
      remote,
      type,
      salaryLow,
      salaryHigh,
      currency
    FROM jobs
    ORDER BY postedAt DESC
  `);

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      company: r.company,
      // build the legacy `location` field so your front-end code can still do job.location.toLowerCase()
      location: `${r.city} – ${r.country}`,
      city: r.city,
      country: r.country,
      officeType: r.officeType,
      experienceLevel: r.experienceLevel,
      employmentType: r.employmentType,
      industry: r.industry,
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
    }))
  );
}

export async function POST(req: NextRequest) {
  // Expect an array of jobs in request body
  const jobs = (await req.json()) as Array<{
    id: string;
    title: string;
    company: string;
    city: string;
    country: string;
    officeType: string;
    experienceLevel: string;
    employmentType: string;
    industry: string;
    visa: boolean;
    benefits: string;     // already comma-joined
    skills: string[];
    url: string;
    postedAt: number;
    remote: boolean;
    type: "j" | "i";
    salaryLow: number;
    salaryHigh: number;
    currency: string;
  }>;

  const db = await openDb();
  const sql = `
    INSERT INTO jobs (
      id, title, company,
      city, country,
      officeType, experienceLevel, employmentType, industry,
      visa, benefits,
      skills, url, postedAt,
      remote, type, salaryLow, salaryHigh, currency
    ) VALUES (
      ?, ?, ?,
      ?, ?,
      ?, ?, ?, ?,
      ?, ?,
      ?, ?, ?,
      ?, ?, ?, ?, ?
    )
    ON CONFLICT(id) DO UPDATE SET
      title            = excluded.title,
      company          = excluded.company,
      city             = excluded.city,
      country          = excluded.country,
      officeType       = excluded.officeType,
      experienceLevel  = excluded.experienceLevel,
      employmentType   = excluded.employmentType,
      industry         = excluded.industry,
      visa             = excluded.visa,
      benefits         = excluded.benefits,
      skills           = excluded.skills,
      url              = excluded.url,
      postedAt         = excluded.postedAt,
      remote           = excluded.remote,
      type             = excluded.type,
      salaryLow        = excluded.salaryLow,
      salaryHigh       = excluded.salaryHigh,
      currency         = excluded.currency
  `.trim();

  const stmt = await db.prepare(sql);
  try {
    for (const job of jobs) {
      await stmt.run(
        job.id,
        job.title,
        job.company,
        job.city,
        job.country,
        job.officeType,
        job.experienceLevel,
        job.employmentType,
        job.industry,
        job.visa ? 1 : 0,
        job.benefits,
        job.skills.join(","),
        job.url,
        job.postedAt,
        job.remote ? 1 : 0,
        job.type,
        job.salaryLow,
        job.salaryHigh,
        job.currency
      );
    }
  } finally {
    await stmt.finalize();
  }

  return NextResponse.json({ success: true, count: jobs.length });
}
