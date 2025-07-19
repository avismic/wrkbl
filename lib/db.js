// lib/db.js
const { Pool } = require("pg");

// Create a single pool instance using the DATABASE_URL injected by Vercel/Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false }, // uncomment only if you hit SSL errors
});

async function openDb() {
  // Ensure the “trash” table exists (preserving your camelCase columns via quoted identifiers)

  await pool.query(`
    CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT,
      "submittedAt" TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS trash (
      id TEXT PRIMARY KEY,
      title TEXT,
      company TEXT,
      city TEXT,
      country TEXT,
      "officeType" TEXT,
      "experienceLevel" TEXT,
      "employmentType" TEXT,
      industry TEXT,
      visa BOOLEAN,
      benefits TEXT,
      skills TEXT,
      url TEXT,
      "postedAt" BIGINT,
      remote BOOLEAN,
      type TEXT,
      "salaryLow" INTEGER,
      "salaryHigh" INTEGER,
      currency TEXT
    );
  `);

  return pool;
}

module.exports = { openDb, pool };
