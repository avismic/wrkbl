// src/app/api/consultation/route.ts

import { NextRequest, NextResponse } from "next/server";
// --- 1. This import is correct ---
import { pool } from "@/lib/db";

// This line forces the route to be dynamic, which is correct.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // This GET function is already correct.
    const { rows } = await pool.query(
      `SELECT id, name, company, email, message, "submittedAt" 
       FROM consultations 
       ORDER BY "submittedAt" DESC`
    );

    console.log("API fetched consultations:", rows);

    return NextResponse.json(rows);
  } catch (error) {
    console.error("Failed to fetch consultations:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
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

    // --- 2. THIS IS THE FIX ---
    // We now use the imported 'pool' directly, just like in the GET function.
    // This ensures the data is correctly inserted into the database.
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
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
