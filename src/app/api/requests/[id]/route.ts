import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

// DELETE /api/requests/:id
export async function DELETE(_req: NextRequest, { params }) {
  const db = await openDb();
  await db.run("DELETE FROM requests WHERE id = ?", params.id);
  return NextResponse.json({ ok: true });
}

// POST /api/requests/:id/post
export async function POST(_req: NextRequest, { params }) {
  const db = await openDb();
  // 1. grab it
  const j = await db.get("SELECT * FROM requests WHERE id = ?", params.id);
  if (!j) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 2. insert into jobs
  const skills = j.skills.split(",");
  await db.run(
    `
    INSERT INTO jobs (id,title,company,location,skills,url,postedAt,remote,type,salaryLow,salaryHigh,currency)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    j.id,
    j.title,
    j.company,
    j.location,
    JSON.stringify(skills),
    j.url,
    j.postedAt,
    j.remote,
    j.type,
    j.salaryLow,
    j.salaryHigh,
    j.currency
  );

  // 3. delete from requests
  await db.run("DELETE FROM requests WHERE id = ?", params.id);

  return NextResponse.json({ ok: true });
}
