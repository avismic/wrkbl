import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function GET() {
  const db = await openDb();
  const reqs = await db.all("SELECT * FROM requests ORDER BY postedAt DESC");
  return NextResponse.json(reqs);
}

export async function POST(req: NextRequest) {
  const data = await req.json(); // single or array
  const db = await openDb();
  const stmt = await db.prepare(`
    INSERT INTO requests(id,title,company,location,skills,url,postedAt,remote,type,salaryLow,salaryHigh,currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  for (const j of Array.isArray(data) ? data : [data]) {
    await stmt.run([
      j.id,
      j.title,
      j.company,
      j.location,
      j.skills.join(","),
      j.url,
      j.postedAt,
      j.remote ? 1 : 0,
      j.type,
      j.salaryLow,
      j.salaryHigh,
      j.currency,
    ]);
  }
  await stmt.finalize();
  return NextResponse.json({ ok: true }, { status: 201 });
}
