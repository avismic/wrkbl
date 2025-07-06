// src/app/api/trash/[id]/post/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const pool  = await openDb();
  const row = await db.get(`SELECT * FROM trash WHERE id = ?`, params.id);

  if (!row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  /* 1 · insert into jobs */
  await db.run(
    `
      INSERT INTO jobs (
        id, title, company,
        city, country,
        officeType, experienceLevel, employmentType, industry,
        visa, benefits,
        skills, url, postedAt,
        remote, type, salaryLow, salaryHigh, currency
      ) VALUES (
        ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
      )
    `,
    row.id, row.title, row.company,
    row.city, row.country,
    row.officeType, row.experienceLevel, row.employmentType, row.industry,
    row.visa, row.benefits,
    row.skills, row.url, row.postedAt,
    row.remote, row.type, row.salaryLow, row.salaryHigh, row.currency
  );

  /* 2 · remove from trash */
  await db.run(`DELETE FROM trash WHERE id = ?`, params.id);

  return NextResponse.json({ posted: true });
}
