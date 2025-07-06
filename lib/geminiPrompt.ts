// lib/geminiPrompt.ts
export interface PromptRow {
  id: string;
  title: string;
  company: string;
  url?: string;
  salaryLow?: number;
  salaryHigh?: number;
}

export function buildGeminiPrompt(
  rows: PromptRow[],
  source: "requests" | "trash"
) {
  return [
    "You are a cautious but **inclusive** moderator for an online job board.",
    "",
    "### TASK",
    "For each JSON object decide whether it is:",
    '• **"valid"** – a plausible job / internship worth publishing',
    '• **"spam"**  – obviously fraudulent, unethical, or missing core info',
    "",
    "**When in doubt, choose *valid*.** Err on inclusion.",
    "",
    "### OUTPUT FORMAT",
    "Reply with **one raw JSON object** (no markdown).",
    'Keys   → row "id"',
    'Values → "valid" or "spam"',
    "",
    "### VERY OBVIOUS RED FLAGS (mark as spam)",
    "1. Contains words like *MLM*, *escort*, *casino*, *crypto pump*, *organ trade*.",
    "2. URL is plain HTTP and the domain looks random (e.g. numbers-only).",
    "3. Salary upper-bound ≥ 10 million (clearly nonsense) **or** ≤ 0.",
    "4. Both *title* **and** *company* are empty.",
    "",
    "### OTHERWISE DEFAULT TO VALID",
    "",
    "### EXAMPLES",
    '{"id":"ok1","title":"Software Engineer","company":"Apple","url":"https://jobs.apple.com/123"} → valid',
    '{"id":"bad1","title":"Crypto Pump Recruiter","company":"MoonCoin","url":"http://moon-pump.xyz"} → spam',
    "",
    `### DATA (source = ${source})`,
    JSON.stringify(rows, null, 2),
    "",
    "### REMINDER",
    "**Respond with only the JSON** — no comments, no markdown.",
  ].join("\n");
}
