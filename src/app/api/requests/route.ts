// src/app/api/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function GET() {
  const db = await openDb();
  const rows: any[] = await db.all(`
    SELECT
      id, title, company,
      city, country,
      officeType, experienceLevel, employmentType, industry,
      visa, benefits,
      skills, url, postedAt,
      remote, type, salaryLow, salaryHigh, currency
    FROM requests
    ORDER BY postedAt DESC
  `);

  return NextResponse.json(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      company: r.company,
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
  const data = await req.json();
  const db = await openDb();
  const sql = `
    INSERT INTO requests (
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
  `.trim();

  const stmt = await db.prepare(sql);
  try {
    for (const j of Array.isArray(data) ? data : [data]) {
      await stmt.run(
        j.id,
        j.title,
        j.company,
        j.city,
        j.country,
        j.officeType,
        j.experienceLevel,
        j.employmentType,
        j.industry,
        j.visa ? 1 : 0,
        j.benefits.join(","),
        j.skills.join(","),
        j.url,
        j.postedAt,
        j.remote ? 1 : 0,
        j.type === "internship" ? "i" : "j",
        j.salaryLow,
        j.salaryHigh,
        j.currency
      );
    }
  } finally {
    await stmt.finalize();
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
