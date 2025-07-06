// src/app/api/requests/[id]/post/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

type Params = { params: { id: string } };

export async function POST(
  _req: NextRequest,
  { params }: Params
) {
  const pool = await openDb();

  // 1) fetch the pending request
  const { rows } = await pool.query<{
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
  }>(
    `
    SELECT
      id, title, company,
      city, country,
      "officeType", "experienceLevel", "employmentType", industry,
      visa, benefits,
      skills, url, "postedAt",
      remote, type, "salaryLow", "salaryHigh", currency
    FROM requests
    WHERE id = $1
  `,
    [params.id]
  );

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 2) insert into jobs with the same columns
  await pool.query(
    `
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
  `,
    [
      row.id,
      row.title,
      row.company,
      row.city,
      row.country,
      row.officeType,
      row.experienceLevel,
      row.employmentType,
      row.industry,
      row.visa,
      row.benefits,
      row.skills,
      row.url,
      row.postedAt,
      row.remote,
      row.type,
      row.salaryLow,
      row.salaryHigh,
      row.currency,
    ]
  );

  // 3) delete the original request
  await pool.query(`DELETE FROM requests WHERE id = $1`, [params.id]);

  return NextResponse.json({ success: true });
}
