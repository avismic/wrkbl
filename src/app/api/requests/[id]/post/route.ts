// src/app/api/requests/[id]/post/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) pull out and await the dynamic id
  const { id } = await params;

  const pool = await openDb();

  // 2) fetch the pending row from `requests`
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
    [id]
  );

  const row = rows[0];
  if (!row) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  // 3) required-field validation
  const hasIndustry = Boolean(row.industry?.trim());
  const skillsList: string[] = row.skills
    .split(",")
    .map((skill: string) => skill.trim()) // annotate parameter type
    .filter((skill: string) => skill.length > 0); // annotate parameter type

  const missing = {
    title: !row.title.trim(),
    company: !row.company.trim(),
    industry: !hasIndustry,
    skills: skillsList.length === 0,
    url: !row.url.trim(),
    type: !(row.type === "j" || row.type === "i"),
  };
  if (Object.values(missing).some((v) => v)) {
    return NextResponse.json(
      { error: "Missing required fields", missing, id: row.id },
      { status: 400 }
    );
  }

  // 4) insert into `jobs` with URL deduplication
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
    ON CONFLICT (url) DO NOTHING
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
      row.industry ?? "",
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

  // 5) remove it from `requests`
  await pool.query(`DELETE FROM requests WHERE id = $1`, [id]);

  return NextResponse.json({ posted: true });
}
