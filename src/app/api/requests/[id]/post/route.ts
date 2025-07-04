// src/app/api/requests/[id]/post/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const db = await openDb();
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
      id
    );
    if (!row) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const insertSql = `
      INSERT INTO jobs (
        id, title, company,
        city, country,
        officeType, experienceLevel, employmentType, industry,
        visa, benefits,
        skills, url, postedAt,
        remote, type, salaryLow, salaryHigh, currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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

    await db.run(`DELETE FROM requests WHERE id = ?`, id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("POST /api/requests/[id]/post error:", err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
