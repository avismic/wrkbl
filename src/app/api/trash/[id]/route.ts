// src/app/api/trash/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

/* form-key → column */
const COLS: Record<string, string> = {
  title: "title", company: "company", city: "city", country: "country",
  officeType: "officeType", experienceLevel: "experienceLevel",
  employmentType: "employmentType",

  industries: "industry",          // ← singular in DB
  benefits: "benefits", skills: "skills",

  visa: "visa", remote: "remote", url: "url", type: "type",

  salaryLow: "salaryLow", salaryHigh: "salaryHigh", currency: "currency",
};

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // params is async
) {
  /* 1 · await params first (kills Next.js warning) */
  const { id } = await context.params;

  /* 2 · body */
  const raw = await req.json();

  /* 3 · normalise */
  const incoming: Record<string, any> = {
    ...raw,

    industries: Array.isArray(raw.industries)
      ? raw.industries.join(",")
      : (raw.industries ?? raw.industry ?? ""),

    benefits: Array.isArray(raw.benefits)
      ? raw.benefits.join(",")
      : (raw.benefits ?? ""),

    skills: Array.isArray(raw.skills)
      ? raw.skills.join(",")
      : (raw.skills ?? ""),

    visa: raw.visa ? 1 : 0,
    remote: raw.remote ? 1 : 0,
    type: raw.type === "internship" ? "i" : "j",
  };

  /* 4 · whitelist keys present in payload */
  const keys = Object.keys(COLS).filter((k) => k in incoming);
  if (!keys.length) {
    return NextResponse.json(
      { error: "No valid columns provided" },
      { status: 400 }
    );
  }

  const setClause = keys.map((k) => `${COLS[k]} = ?`).join(", ");
  const values    = keys.map((k) => incoming[k]);

  const pool = await openDb();

  /* 5 · UPDATE + capture changes counter */
  const res = await db.run(
    `UPDATE trash SET ${setClause} WHERE id = ?`,
    ...values,
    id
  ); // res.changes === 0  → nothing actually updated

  /* 6 · fetch the row back */
  const row = await db.get(`SELECT * FROM trash WHERE id = ?`, id);

  return NextResponse.json({ changes: res.changes, row });
}
