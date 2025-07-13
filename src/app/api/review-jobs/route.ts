// src/app/api/review-jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt } from "@/lib/geminiPrompt";

/* ─── Gemini setup ─── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/* columns we copy to trash */
// const cols = [
//   "id",
//   "title",
//   "company",
//   "city",
//   "country",
//   "officeType",
//   "experienceLevel",
//   "employmentType",
//   "industries",
//   "visa",
//   "benefits",
//   "skills",
//   "url",
//   "postedAt",
//   "remote",
//   "type",
//   "salaryLow",
//   "salaryHigh",
//   "currency",
// ].join(",");

const cols = [
  "id",
  "title",
  "company",
  "city",
  "country",
  '"officeType"',
  '"experienceLevel"',
  '"employmentType"',
  "industry",
  "visa",
  "benefits",
  "skills",
  "url",
  '"postedAt"',
  "remote",
  "type",
  '"salaryLow"',
  '"salaryHigh"',
  "currency",
].join(",");

export async function POST(req: NextRequest) {
  const { ids } = (await req.json()) as { ids: string[] };

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs supplied" }, { status: 400 });
  }

  /* 1 ▸ fetch the selected rows */
  const pool = await openDb();
  const { rows } = await pool.query(
    `SELECT id, title, company, url, "salaryLow", "salaryHigh"
       FROM jobs
       WHERE id = ANY($1)`,
    [ids]
  );
  if (rows.length === 0) {
    return NextResponse.json({ error: "IDs not found" }, { status: 404 });
  }

  /* 2 ▸ Gemini verdicts */
  const prompt = buildGeminiPrompt(
    rows.map(
      (j: {
        id: string;
        title: string;
        company: string;
        url: string;
        salaryLow: number;
        salaryHigh: number;
      }) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        url: j.url,
        salaryLow: j.salaryLow,
        salaryHigh: j.salaryHigh,
      })
    ),
    "requests"
  );

  let verdicts: Record<string, string>;
  try {
    const rsp = await model.generateContent(prompt);
    const cleaned = rsp.response
      .text()
      .replace(/^```json\s*|```$/g, "")
      .trim();
    verdicts = JSON.parse(cleaned);
  } catch {
    verdicts = Object.fromEntries(ids.map((id) => [id, "spam"]));
  }

  const spamIds = Object.entries(verdicts)
    .filter(([, v]) => v === "spam")
    .map(([id]) => id);

  /* 3 ▸ move spam rows to trash */
  await pool.query("BEGIN");
  try {
    if (spamIds.length) {
      await pool.query(
        `INSERT INTO trash (${cols})
           SELECT ${cols} FROM jobs WHERE id = ANY($1)
           ON CONFLICT DO NOTHING`,
        [spamIds]
      );
      await pool.query(`DELETE FROM jobs WHERE id = ANY($1)`, [spamIds]);
    }
    await pool.query("COMMIT");
  } catch (e) {
    await pool.query("ROLLBACK");
    throw e;
  }

  return NextResponse.json({
    results: verdicts,
    movedToTrash: spamIds,
  });
}
