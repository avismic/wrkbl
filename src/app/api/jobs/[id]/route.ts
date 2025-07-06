// src/app/api/jobs/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pool = await openDb();
  await pool.query(`DELETE FROM jobs WHERE id = $1`, [id]);
  return NextResponse.json({ success: true });
}
