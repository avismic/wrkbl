import { NextResponse } from "next/server";
import { openDb } from "@/lib/db";

// POST /api/requests/{id}/post
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  try {
    const db = await openDb();

    // 1) fetch the pending request
    const row = await db.get(`SELECT * FROM requests WHERE id = ?`, id);
    if (!row) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // 2) insert it into jobs
    await db.run(
      `INSERT INTO jobs
         (id, title, company, location, skills, url, postedAt, remote, type, salaryLow, salaryHigh, currency)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      row.id,
      row.title,
      row.company,
      row.location,
      row.skills,
      row.url,
      row.postedAt,
      row.remote,
      row.type,
      row.salaryLow,
      row.salaryHigh,
      row.currency
    );

    // 3) delete it from requests
    await db.run(`DELETE FROM requests WHERE id = ?`, id);

    // 4) return
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/requests/[id]/post error:", err);
    return NextResponse.json(
      { message: (err as Error).message },
      { status: 500 }
    );
  }
}
