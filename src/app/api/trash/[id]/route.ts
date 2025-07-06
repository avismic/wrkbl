// src/app/api/trash/[id]/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

/* form-key → column */
const COLS: Record<string, string> = {
  title: "title",
  company: "company",
  city: "city",
  country: "country",
  officeType: "officeType",
  experienceLevel: "experienceLevel",
  employmentType: "employmentType",
  industries: "industry",          // ← singular in DB
  benefits: "benefits",
  skills: "skills",
  visa: "visa",
  remote: "remote",
  url: "url",
  type: "type",
  salaryLow: "salaryLow",
  salaryHigh: "salaryHigh",
  currency: "currency",
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1. await the dynamic id
  const { id } = await params;

  // 2. parse the incoming body
  const raw = await request.json();

  // 3. normalize CSV fields and booleans
  const incoming: Record<string, any> = {
    ...raw,
    industries: Array.isArray(raw.industries)
      ? raw.industries.join(",")
      : raw.industries ?? raw.industry ?? "",
    benefits: Array.isArray(raw.benefits)
      ? raw.benefits.join(",")
      : raw.benefits ?? "",
    skills: Array.isArray(raw.skills)
      ? raw.skills.join(",")
      : raw.skills ?? "",
    visa: raw.visa ? 1 : 0,
    remote: raw.remote ? 1 : 0,
    type: raw.type === "internship" ? "i" : "j",
  };

  // 4. whitelist only keys present
  const keys = Object.keys(COLS).filter((k) => k in incoming);
  if (keys.length === 0) {
    return NextResponse.json(
      { error: "No valid columns provided" },
      { status: 400 }
    );
  }

  // 5. build SET clause & values
  const setClause = keys
    .map((k, i) => `${COLS[k]} = $${i + 1}`)
    .join(", ");
  const values = keys.map((k) => incoming[k]);
  values.push(id);

  // 6. execute UPDATE
  const pool = await openDb();
  const res = await pool.query(
    `UPDATE trash SET ${setClause} WHERE id = $${values.length}`,
    values
  );

  // 7. fetch the updated row
  const select = await pool.query(`SELECT * FROM trash WHERE id = $1`, [id]);
  const row = select.rows[0] ?? null;

  return NextResponse.json({
    changes: res.rowCount,
    row,
  });
}
