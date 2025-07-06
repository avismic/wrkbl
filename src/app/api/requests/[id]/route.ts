// src/app/api/requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const pool = await openDb();
  await db.run(`DELETE FROM requests WHERE id = ?`, id);
  return NextResponse.json({ success: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // 1) read body before params
  const body = await req.json();
  const id = params.id;

  // 2) CSV-join your arrays
  const industryCsv = Array.isArray(body.industries)
    ? body.industries.join(",")
    : body.industries || "";
  const benefitsCsv = Array.isArray(body.benefits)
    ? body.benefits.join(",")
    : body.benefits || "";
  const skillsCsv = Array.isArray(body.skills)
    ? body.skills.join(",")
    : body.skills || "";

  // 3) pull everything else out
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
  await db.run(
    `
    UPDATE requests
    SET
      title           = ?,
      company         = ?,
      city            = ?,
      country         = ?,
      officeType      = ?,
      experienceLevel = ?,
      employmentType  = ?,
      industry        = ?,
      visa            = ?,
      benefits        = ?,
      skills          = ?,
      url             = ?,
      postedAt        = ?,
      remote          = ?,
      type            = ?,
      salaryLow       = ?,
      salaryHigh      = ?,
      currency        = ?
    WHERE id = ?
  `,
    title,
    company,
    city,
    country,
    officeType,
    experienceLevel,
    employmentType,
    industryCsv,
    visa ? 1 : 0,
    benefitsCsv,
    skillsCsv,
    url,
    postedAt,
    remote ? 1 : 0,
    type === "internship" ? "i" : "j",
    salaryLow,
    salaryHigh,
    currency,
    id
  );

  return NextResponse.json({ updated: true });
}
