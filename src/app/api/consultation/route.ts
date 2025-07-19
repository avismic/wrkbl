// src/app/api/consultation/route.ts

import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

// This line explicitly tells Next.js to treat this route as dynamic,
// bypassing any and all data caching for GET requests.
export const dynamic = "force-dynamic";

// GET handler to fetch all consultation requests for the admin panel
// By adding the `request` parameter, we ensure this function is always
// treated as dynamic by the Next.js server.
export async function GET(request: NextRequest) {
  try {
    const pool = await openDb();
    const { rows } = await pool.query(
      `SELECT id, name, company, email, message, "submittedAt" 
       FROM consultations 
       ORDER BY "submittedAt" DESC`
    );

    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    return NextResponse.json(rows, { headers });
  } catch (error) {
    console.error("Failed to fetch consultations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST handler to submit a new consultation request
export async function POST(req: NextRequest) {
  try {
    const { name, company, email, message } = await req.json();

    if (!name || !company || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const pool = await openDb();
    const sql = `
      INSERT INTO consultations (name, company, email, message) 
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `;
    const result = await pool.query(sql, [name, company, email, message]);

    return NextResponse.json(
      { success: true, id: result.rows[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to submit consultation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
