// src/app/api/review-trash/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt } from "@/lib/geminiPrompt"; 

/* ─── Gemini ─── */
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model  = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

const cols = `
  id,title,company,
  city,country,
  officeType,experienceLevel,employmentType,industry,
  visa,benefits,skills,url,postedAt,
  remote,type,salaryLow,salaryHigh,currency
`.replace(/\s+/g, "");

export async function POST(req: NextRequest) {
  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs supplied" }, { status: 400 });
  }

  const pool = await openDb();
  const placeholders = ids.map(() => "?").join(",");
  const rows: any[] = await pool.all(
    `SELECT
        id, title, company,
        city, country, skills, type, url,
        salaryLow, salaryHigh, officeType
     FROM trash
     WHERE id IN (${placeholders})`,
    ...ids
  );

  /* build prompt – identical rules to /review-requests */
  const prompt = buildGeminiPrompt(
    rows.map((j: any) => ({
      id: j.id,
      title: j.title,
      company: j.company,
      url: j.url,
      salaryLow: j.salaryLow,
      salaryHigh: j.salaryHigh,
    })),
    "requests"
  );

  const rsp    = await model.generateContent(prompt);
  const rawTxt = rsp.response.text().trim();

  /* tolerant parse */
  const tryParse = (raw: string) => {
    const nf = raw.replace(/^```[\s\S]*?\n/, "").replace(/```$/, "").trim();
    try { return JSON.parse(nf); } catch {}
    const f = nf.indexOf("{"), l = nf.lastIndexOf("}");
    if (f !== -1 && l !== -1 && l > f) {
      try { return JSON.parse(nf.slice(f, l + 1)); } catch {}
    }
    return null;
  };

  const parsed = tryParse(rawTxt);
  if (!parsed || typeof parsed !== "object") {
    return NextResponse.json(
      { error: "Could not parse Gemini", raw: rawTxt },
      { status: 500 }
    );
  }
  const results: Record<string, string> = parsed as any;

  const validIds = Object.entries(results)
    .filter(([, v]) => v === "valid")
    .map(([id]) => id);

  /* move each “valid” row straight into jobs */
  if (validIds.length) {
    const ph = validIds.map(() => "?").join(",");
    await pool.run(
      `INSERT OR IGNORE INTO jobs (${cols})
       SELECT ${cols} FROM trash WHERE id IN (${ph})`,
      ...validIds
    );
    await pool.run(
      `DELETE FROM trash WHERE id IN (${ph})`,
      ...validIds
    );
  }

  return NextResponse.json({ results, posted: validIds });
}
