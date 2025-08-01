// src/app/api/requests/[id]/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) await your dynamic id
  const { id } = await params;

  // 2) delete the request
  const pool = await openDb();
  await pool.query(`DELETE FROM requests WHERE id = $1`, [id]);

  return NextResponse.json({ success: true });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) await params and parse body
  const { id } = await params;
  const body = await request.json();

  // 2) CSV-join arrays
  const industryCsv = Array.isArray(body.industries)
    ? body.industries.join(",")
    : body.industries ?? "";
  const benefitsCsv = Array.isArray(body.benefits)
    ? body.benefits.join(",")
    : body.benefits ?? "";
  const skillsCsv = Array.isArray(body.skills)
    ? body.skills.join(",")
    : body.skills ?? "";

  // 3) pull out the rest
  const {
    title,
    company,
    city,
    country,
    officeType,
    experienceLevel,
    employmentType,
    visa,
    url,
    postedAt,
    remote,
    type,
    salaryLow,
    salaryHigh,
    currency,
  } = body;

  // 4) update the row
  const pool = await openDb();
  await pool.query(
    `
    UPDATE requests
    SET
      title             = $1,
      company           = $2,
      city              = $3,
      country           = $4,
      "officeType"      = $5,
      "experienceLevel" = $6,
      "employmentType"  = $7,
      industry          = $8,
      visa              = $9,
      benefits          = $10,
      skills            = $11,
      url               = $12,
      "postedAt"        = $13,
      remote            = $14,
      type              = $15,
      "salaryLow"       = $16,
      "salaryHigh"      = $17,
      currency          = $18
    WHERE id = $19
    `,
    [
      title,
      company,
      city,
      country,
      officeType,
      experienceLevel,
      employmentType,
      industryCsv,
      visa,
      benefitsCsv,
      skillsCsv,
      url,
      postedAt,
      remote,
      type === "internship" ? "i" : "j",
      salaryLow,
      salaryHigh,
      currency,
      id,
    ]
  );

  return NextResponse.json({ updated: true });
}
