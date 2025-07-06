// src/app/api/requests/[id]/post/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const pool = await openDb();

  // 1) fetch the pending request, including all new fields
  const row: any = await db.get(
    `
    SELECT
      id, title, company,
      city, country,
      officeType, experienceLevel, employmentType, industry,
      visa, benefits,
      skills, url, postedAt,
      remote, type, salaryLow, salaryHigh, currency
    FROM requests
    WHERE id = ?
  `,
    params.id
  );

  if (!row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 2) insert into jobs with the same columns
  const insertSql = `
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
  `.trim();

  await db.run(
    insertSql,
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
    row.currency
  );

  // 3) delete the request
  await db.run(`DELETE FROM requests WHERE id = ?`, params.id);

  return NextResponse.json({ success: true });
}
