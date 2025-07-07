// src/app/api/review-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt } from "@/lib/geminiPrompt";

/* ─── Gemini init ─── */
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function POST(req: NextRequest) {
  const { ids } = (await req.json()) as { ids: string[] };
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs supplied" }, { status: 400 });
  }

  const pool = await openDb();

  // Build $1,$2... placeholders
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");

  // 1) Fetch from requests
  const selectSql = `
    SELECT
      id,
      title,
      company,
      city,
      country,
      skills,
      type,
      url,
      "salaryLow",
      "salaryHigh",
      "officeType"
    FROM requests
    WHERE id IN (${placeholders})
  `;
  const selectRes = await pool.query(selectSql, ids);
  const rows = selectRes.rows as Array<{
    id: string;
    title: string;
    company: string;
    city: string;
    country: string;
    skills: string;
    type: string;
    url: string;
    salaryLow: number;
    salaryHigh: number;
    officeType: string;
  }>;

  // 2) Build prompt
  const prompt = buildGeminiPrompt(
    rows.map((r) => ({
      id: r.id,
      title: r.title,
      company: r.company,
      url: r.url,
      salaryLow: r.salaryLow,
      salaryHigh: r.salaryHigh,
    })),
    "requests"
  );

  // 3) Call Gemini
  const rsp = await model.generateContent(prompt);
  const rawText: string = (await rsp.response.text()).trim();

  // 4) Tolerant JSON parse
  function tryParse(raw: string): any | null {
    const noFence = raw.replace(/^```[\s\S]*?\n/, "").replace(/```$/, "").trim();
    try {
      return JSON.parse(noFence);
    } catch {
      const f = noFence.indexOf("{");
      const l = noFence.lastIndexOf("}");
      if (f !== -1 && l !== -1 && l > f) {
        try {
          return JSON.parse(noFence.slice(f, l + 1));
        } catch {
          return null;
        }
      }
      return null;
    }
  }

  const parsed = tryParse(rawText);
  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { error: "Could not parse Gemini response", raw: rawText },
      { status: 500 }
    );
  }
  const results = parsed as Record<string, string>;

  // 5) Move “spam” rows to trash
  const spamIds = Object.entries(results)
    .filter(([, verdict]) => verdict === "spam")
    .map(([id]) => id);

  if (spamIds.length) {
    const ph2 = spamIds.map((_, i) => `$${i + 1}`).join(",");
    const insertSql = `
      INSERT INTO trash (
        id,title,company,
        city,country,
        "officeType","experienceLevel","employmentType",industry,
        visa,benefits,
        skills,url,"postedAt",
        remote,type,"salaryLow","salaryHigh",currency
      )
      SELECT
        id,title,company,
        city,country,
        "officeType","experienceLevel","employmentType",industry,
        visa,benefits,
        skills,url,"postedAt",
        remote,type,"salaryLow","salaryHigh",currency
      FROM requests
      WHERE id IN (${ph2})
      ON CONFLICT DO NOTHING
    `;
    await pool.query(insertSql, spamIds);

    const deleteSql = `DELETE FROM requests WHERE id IN (${ph2})`;
    await pool.query(deleteSql, spamIds);
  }

  return NextResponse.json({ results, movedToTrash: spamIds });
}
