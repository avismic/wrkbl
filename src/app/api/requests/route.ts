// src/app/api/requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt } from "@/lib/geminiPrompt";

// ─── Gemini setup ──────────────────────────────────────────────
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

// ─── helpers ───────────────────────────────────────────────────
const csv = (arr: string[] = []) => arr.join(",");
const colsList = [
  "id",
  "title",
  "company",
  "city",
  "country",
  `"officeType"`,
  `"experienceLevel"`,
  `"employmentType"`,
  "industry",
  "visa",
  "benefits",
  "skills",
  "url",
  `"postedAt"`,
  "remote",
  "type",
  `"salaryLow"`,
  `"salaryHigh"`,
  "currency",
];
const cols = colsList.join(",");
const placeholders = colsList.map((_, i) => `$${i + 1}`).join(",");

export async function GET() {
  const pool = await openDb();
  const { rows } = await pool.query(
    `SELECT ${cols} FROM requests ORDER BY "postedAt" DESC`
  );

  return NextResponse.json(
    rows.map((r: any) => ({
      ...r,
      visa: !!r.visa,
      remote: !!r.remote,
      benefits: r.benefits.split(",").filter(Boolean),
      skills: r.skills.split(",").filter(Boolean),
      type: r.type === "i" ? "internship" : "job",
    }))
  );
}

export async function POST(req: NextRequest) {
  const incoming = await req.json();
  const rowsData = Array.isArray(incoming) ? incoming : [incoming];

  // 1 · Gemini review
  const prompt = buildGeminiPrompt(
    rowsData.map((j) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      url: j.url,
      salaryLow: j.salaryLow,
      salaryHigh: j.salaryHigh,
    })),
    "requests"
  );

  let verdicts: Record<string, string> | null = null;
  try {
    const rsp = await model.generateContent(prompt);
    const txt = rsp
      .response.text()
      .trim()
      .replace(/^```[\s\S]*?\n/, "")
      .replace(/```$/, "")
      .trim();
    verdicts = JSON.parse(txt);
  } catch {
    verdicts = null;
  }

  const validIds: string[] = [];
  const spamIds: string[] = [];
  if (verdicts) {
    for (const [id, v] of Object.entries(verdicts)) {
      (v === "valid" ? validIds : spamIds).push(id);
    }
  } else {
    spamIds.push(...rowsData.map((r) => r.id));
  }

  // 2 · DB writes inside manual transaction
  const pool = await openDb();
  await pool.query("BEGIN");
  try {
    // a) valid → jobs
    if (validIds.length) {
      for (const j of rowsData.filter((r) => validIds.includes(r.id))) {
        const values = [
          j.id,
          j.title,
          j.company,
          j.city,
          j.country,
          j.officeType,
          j.experienceLevel,
          j.employmentType,
          csv(j.industries),
          j.visa,
          csv(j.benefits),
          csv(j.skills),
          j.url,
          j.postedAt,
          j.remote ?? false,               // <-- now defaults to false, never null
          j.type === "internship" ? "i" : "j",
          j.salaryLow,
          j.salaryHigh,
          j.currency,
        ];
        await pool.query(
          `INSERT INTO jobs (${cols}) VALUES (${placeholders})`,
          values
        );
      }
    }

    // b) spam → requests
    if (spamIds.length) {
      for (const j of rowsData.filter((r) => spamIds.includes(r.id))) {
        const values = [
          j.id,
          j.title,
          j.company,
          j.city,
          j.country,
          j.officeType,
          j.experienceLevel,
          j.employmentType,
          csv(j.industries),
          j.visa,
          csv(j.benefits),
          csv(j.skills),
          j.url,
          j.postedAt,
          j.remote ?? false,               // <-- and here too
          j.type === "internship" ? "i" : "j",
          j.salaryLow,
          j.salaryHigh,
          j.currency,
        ];
        await pool.query(
          `INSERT INTO requests (${cols}) VALUES (${placeholders})`,
          values
        );
      }
    }

    await pool.query("COMMIT");
  } catch (err) {
    await pool.query("ROLLBACK");
    throw err;
  }

  // 3 · response
  return NextResponse.json(
    { posted: validIds, queued: spamIds },
    { status: 201 }
  );
}
