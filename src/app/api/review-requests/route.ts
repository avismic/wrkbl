// src/app/api/review-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt } from "@/lib/geminiPrompt";

/* ─── Gemini init ─── */
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

const cols = `
  id,title,company,
  city,country,
  officeType,experienceLevel,employmentType,industry,
  visa,benefits,
  skills,url,postedAt,
  remote,type,salaryLow,salaryHigh,currency
`.replace(/\s+/g, "");

export async function POST(req: NextRequest) {
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs supplied" }, { status: 400 });
  }

  const pool = await openDb();
  // build placeholder list
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(",");
  // fetch the selected rows
  const selectSql = `
    SELECT
      id, title, company,
      city, country, skills, type, url,
      salaryLow, salaryHigh, officeType
    FROM requests
    WHERE id IN (${placeholders})
  `;
  const selectRes = await pool.query(selectSql, ids);
  const rows = selectRes.rows;

  /* ─── build prompt ─── */
  const prompt = buildGeminiPrompt(
    rows.map((r: any) => ({
      id: r.id,
      title: r.title,
      company: r.company,
      url: r.url,
      salaryLow: r.salarylow,
      salaryHigh: r.salaryhigh,
    })),
    "requests"
  );

  /* ─── call Gemini ─── */
  const rsp = await model.generateContent(prompt);
  const rawText = rsp.response.text().trim();

  /* ─── tolerant JSON parse ─── */
  const tryParse = (raw: string) => {
    const noFence = raw
      .replace(/^```[\s\S]*?\n/, "")
      .replace(/```$/, "")
      .trim();
    try {
      return JSON.parse(noFence);
    } catch {}
    const f = noFence.indexOf("{"),
      l = noFence.lastIndexOf("}");
    if (f !== -1 && l !== -1 && l > f) {
      try {
        return JSON.parse(noFence.slice(f, l + 1));
      } catch {}
    }
    return null;
  };
  const parsed = tryParse(rawText);
  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { error: "Could not parse Gemini response", raw: rawText },
      { status: 500 }
    );
  }
  const results: Record<string, string> = parsed as any;

  /* ─── move every “spam” row to trash ─── */
  const spamIds = Object.entries(results)
    .filter(([, verdict]) => verdict === "spam")
    .map(([id]) => id);

  if (spamIds.length) {
    // move to trash
    const ph2 = spamIds.map((_, i) => `$${i + 1}`).join(",");
    const insertSql = `
      INSERT INTO trash (${cols})
      SELECT ${cols} FROM requests WHERE id IN (${ph2})
      ON CONFLICT DO NOTHING
    `;
    await pool.query(insertSql, spamIds);

    // delete from requests
    const deleteSql = `DELETE FROM requests WHERE id IN (${ph2})`;
    await pool.query(deleteSql, spamIds);
  }

  return NextResponse.json({ results, movedToTrash: spamIds });
}
