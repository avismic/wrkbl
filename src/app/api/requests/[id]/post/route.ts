// src/app/api/requests/[id]/route.ts
import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

// The main change is in the function signature here.
// The second argument is destructured to get `params`,
// and its type is correctly defined as { params: { id: string } }.
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // 1) Pull out the dynamic id.
  // No `await` is needed here as `params` is not a promise.
  const { id } = params;

  const pool = await openDb();

  try {
    // 2) Fetch the pending request from the database.
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

    // If the request with the given ID doesn't exist, return a 404.
    if (!row) {
      return NextResponse.json({ message: "Request not found" }, { status: 404 });
    }

    // 3) Insert the fetched data into the `jobs` table.
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

    // 4) Delete the original request from the `requests` table.
    await pool.query(`DELETE FROM requests WHERE id = $1`, [id]);

    // Return a success response.
    return NextResponse.json({ success: true });

  } catch (error) {
    // Basic error handling in case something goes wrong with the database operations.
    console.error("Failed to process request:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
