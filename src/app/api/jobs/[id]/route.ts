// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await openDb();
  const stmt = await db.prepare(`DELETE FROM jobs WHERE id = ?`);
  await stmt.run(params.id);
  await stmt.finalize();
  return NextResponse.json({ success: true });
}
