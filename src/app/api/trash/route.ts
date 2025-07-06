// src/app/api/trash/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function GET() {
  const pool = await openDb();
  const { rows } = await pool.query(`
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
    FROM trash
    ORDER BY "postedAt" DESC
  `);

  return NextResponse.json(
    rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      company: r.company,
      city: r.city,
      country: r.country,
      officeType: r.officeType,
      experienceLevel: r.experienceLevel,
      employmentType: r.employmentType,

      /* expose as “industries” for the React normaliser */
      industries: (r.industry ?? "").split(",").filter(Boolean),

      benefits: (r.benefits ?? "").split(",").filter(Boolean),
      visa: !!r.visa,
      skills: (r.skills ?? "").split(",").filter(Boolean),

      url: r.url,
      postedAt: r.postedAt,
      remote: !!r.remote,
      type: r.type === "i" ? "internship" : "job",
      salaryLow: r.salaryLow,
      salaryHigh: r.salaryHigh,
      currency: r.currency,
    }))
  );
}
