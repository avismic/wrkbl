
// src/app/api/review-requests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openDb } from "@/lib/db";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildGeminiPrompt } from "@/lib/geminiPrompt";  

/* ─── Gemini init ─── */
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model  = gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

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

  const pool            = await openDb();
  const placeholders  = ids.map(() => "?").join(",");
  const {rows}: any[]   = await pool.all(
    `SELECT
        id, title, company,
        city, country, skills, type, url,
        salaryLow, salaryHigh, officeType
     FROM requests
     WHERE id IN (${placeholders})`,
    ...ids
  );

  /* ─── build prompt (unchanged) ─── */
  // const prompt = [
  //   "You are an expert compliance reviewer for an online job board.",
  //   "",
  //   "### TASK",
  //   "For every JSON object below decide whether it is:",
  //   '• **"valid"** – a plausible job / internship post with enough information to publish',
  //   '• **"spam"**  – scam, unethical, illegal, or missing critical fields',
  //   "",
  //   'When you are unsure, default to **"valid"** (erring on inclusion).',
  //   "",
  //   "### OUTPUT FORMAT",
  //   "Return **only** one raw JSON object, no markdown fences, no extra keys.",
  //   'Keys   → the row "id"',
  //   'Values → "valid" or "spam"',
  //   "",
  //   "### RED FLAGS (usually spam)",
  //   '1. URL does **not** start with "https://" *or* has a suspicious TLD (.xyz, .onion, IP-literal).',
  //   "2. Title / company contains words like MLM, Pyramid, Pump, Click-Farm, Organ, Escort, Casino.",
  //   "3. Industry or description mentions illegal trade or illicit services.",
  //   "4. salaryHigh ≤ 0 **or** ≥ 1 000 000.",
  //   "5. Missing any of these fields: *title* **OR** *company* **OR** *url*.",
  //   '6. Any field equals "Unknown", "N/A", or empty string.',
  //   "",
  //   "### GREEN FLAGS (usually valid)",
  //   "✓ URL starts with https:// and host looks like a company site (jobs.apple.com, careers.microsoft.com, etc.).",
  //   "✓ Company is in Fortune-500 **OR** host matches a normal corporate domain (e.g. “acme-saas.com”).",
  //   "✓ salaryLow ≥ 18 000 and salaryHigh is a realistic upper bound (< 1 000 000).",
  //   "✓ officeType is one of: Remote / Remote-Anywhere / Hybrid / In-Office / On-Site.",
  //   "",
  //   "### FEW-SHOT EXAMPLES",
  //   '{ "id":"ex-good-us","title":"Frontend Engineer","company":"Apple",',
  //   '  "url":"https://jobs.apple.com/en-us/details/123/frontend-engineer",',
  //   '  "salaryLow":130000,"salaryHigh":175000 } → valid',
  //   "",
  //   '{ "id":"ex-good-eu","title":"Azure Cloud Architect","company":"Microsoft",',
  //   '  "url":"https://careers.microsoft.com/i18n/jobs/98765",',
  //   '  "salaryLow":90000,"salaryHigh":140000 } → valid',
  //   "",
  //   '{ "id":"ex-good-smb","title":"Product Designer","company":"Acme SaaS",',
  //   '  "url":"https://acme-saas.com/careers/567",',
  //   '  "salaryLow":80000,"salaryHigh":120000 } → valid',
  //   "",
  //   '{ "id":"ex-bad-pump","title":"Crypto Pump Recruiter","company":"MoonCoin",',
  //   '  "url":"http://mooncoin-profit.xyz","salaryLow":50000,"salaryHigh":150000 } → spam',
  //   "",
  //   '{ "id":"ex-bad-wild","title":"Luxury Wildlife Trader","company":"ExoticFauna Ltd.",',
  //   '  "url":"http://exoticfauna.trade","salaryLow":120000,"salaryHigh":180000 } → spam',
  //   "",
  //   "### DATA",
  //   JSON.stringify(rows, null, 2),
  //   "",
  //   "### INSTRUCTIONS TO GEMINI",
  //   "Think step-by-step but **output ONLY the JSON object**.",
  //   "If you output anything else the job board will reject it."
  // ].join("\n");

  const prompt = buildGeminiPrompt(
    rows.map(r => ({
      id: r.id,
      title: r.title,
      company: r.company,
      url: r.url,
      salaryLow: r.salaryLow,
      salaryHigh: r.salaryHigh,
    })),
    "requests"
  );
  
  /* ─── call Gemini ─── */
  const rsp      = await model.generateContent(prompt);
  const rawText  = rsp.response.text().trim();

  /* ─── tolerant JSON parse ─── */
  const tryParse = (raw: string) => {
    const noFence = raw.replace(/^```[\s\S]*?\n/, "").replace(/```$/, "").trim();
    try { return JSON.parse(noFence); } catch {}
    const f = noFence.indexOf("{"), l = noFence.lastIndexOf("}");
    if (f !== -1 && l !== -1 && l > f) {
      try { return JSON.parse(noFence.slice(f, l + 1)); } catch {}
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
    const ph = spamIds.map(() => "?").join(",");
    await db.run(
      `INSERT OR IGNORE INTO trash (${cols})
       SELECT ${cols} FROM requests WHERE id IN (${ph})`,
      ...spamIds
    );
    await db.run(`DELETE FROM requests WHERE id IN (${ph})`, ...spamIds);
  }

  return NextResponse.json({ results, movedToTrash: spamIds });
}
