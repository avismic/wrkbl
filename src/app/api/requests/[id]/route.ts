// src/app/api/requests/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = await openDb();
  await db.run(`DELETE FROM requests WHERE id = ?`, params.id);
  return NextResponse.json({ ok: true });
}
