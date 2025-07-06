// IMPORTANT: This file MUST be located at src/app/api/requests/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

// Define a type for the context object for clarity.
type RouteContext = {
  params: {
    id: string;
  };
};

// DELETE handler with the updated signature
export async function DELETE(
  _req: NextRequest,
  context: RouteContext
) {
  // Destructure params from the context object here.
  const { id } = context.params;
  const pool = await openDb();
  await pool.query(`DELETE FROM requests WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}

// POST handler with the updated signature
export async function POST(
  req: NextRequest,
  context: RouteContext
) {
  // 1) Get the dynamic id from the context object.
  const { id } = context.params;
  
  // 2) Read the request body.
  const body = await req.json();

  // 3) CSV-join your arrays, handling cases where they might be missing or not arrays.
  const industryCsv = Array.isArray(body.industries)
    ? body.industries.join(",")
    : body.industries ?? "";
  const benefitsCsv = Array.isArray(body.benefits)
    ? body.benefits.join(",")
    : body.benefits ?? "";
  const skillsCsv = Array.isArray(body.skills)
    ? body.skills.join(",")
    : body.skills ?? "";

  // 4) Pull everything else out of the body.
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

  // 5) Update the row in the database.
  const pool = await openDb();
  try {
    await pool.query(
      `
      UPDATE requests
      SET
        title            = $1,
        company          = $2,
        city             = $3,
        country          = $4,
        "officeType"     = $5,
        "experienceLevel"= $6,
        "employmentType" = $7,
        industry         = $8,
        visa             = $9,
        benefits         = $10,
        skills           = $11,
        url              = $12,
        "postedAt"       = $13,
        remote           = $14,
        type             = $15,
        "salaryLow"      = $16,
        "salaryHigh"     = $17,
        currency         = $18
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
  } catch (error) {
    console.error("Failed to update request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
