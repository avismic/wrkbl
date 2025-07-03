// src/app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function GET() {
  const db = await openDb();
  const rows: any[] = await db.all(`
    SELECT
      id, title, company, location, skills, url, postedAt,
      remote, type, salaryLow, salaryHigh, currency
    FROM jobs
    ORDER BY postedAt DESC
  `);
  return NextResponse.json(
    rows.map((r) => ({
      ...r,
      skills: r.skills.split(",").map((s: string) => s.trim()),
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
    location: string;
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
  // Define the SQL as a plain string
  const sql = `
    INSERT INTO jobs
      (id, title, company, location, skills, url, postedAt,
       remote, type, salaryLow, salaryHigh, currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title       = excluded.title,
      company     = excluded.company,
      location    = excluded.location,
      skills      = excluded.skills,
      url         = excluded.url,
      postedAt    = excluded.postedAt,
      remote      = excluded.remote,
      type        = excluded.type,
      salaryLow   = excluded.salaryLow,
      salaryHigh  = excluded.salaryHigh,
      currency    = excluded.currency
  `.trim();

  const stmt = await db.prepare(sql);
  try {
    for (const job of jobs) {
      await stmt.run(
        job.id,
        job.title,
        job.company,
        job.location,
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
