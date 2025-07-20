// scripts/init-db.js
require("dotenv").config();
const { openDb } = require("../lib/db");

(async () => {
  try {
    const pool = await openDb();

    // ─── jobs table ────────────────────────────────────────────────
    await pool.query("DROP TABLE IF EXISTS jobs;");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        "officeType" TEXT NOT NULL,
        "experienceLevel" TEXT NOT NULL,
        "employmentType" TEXT NOT NULL,
        industry TEXT NOT NULL DEFAULT '',
        visa BOOLEAN NOT NULL DEFAULT false,
        benefits TEXT NOT NULL,
        skills TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        "postedAt" BIGINT NOT NULL,
        remote BOOLEAN NOT NULL DEFAULT false,
        type TEXT NOT NULL DEFAULT 'j',
        "salaryLow" INTEGER NOT NULL DEFAULT 0,
        "salaryHigh" INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT '$'
      );
    `);
    console.log("✅ jobs table initialized with all new fields");

    // ─── requests table ────────────────────────────────────────────
    await pool.query("DROP TABLE IF EXISTS requests;");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        "officeType" TEXT NOT NULL,
        "experienceLevel" TEXT NOT NULL,
        "employmentType" TEXT NOT NULL,
        industry TEXT NOT NULL DEFAULT '',
        visa BOOLEAN NOT NULL DEFAULT false,
        benefits TEXT NOT NULL,
        skills TEXT NOT NULL,
        url TEXT NOT NULL,
        "postedAt" BIGINT NOT NULL,
        remote BOOLEAN NOT NULL DEFAULT false,
        type TEXT NOT NULL DEFAULT 'j',
        "salaryLow" INTEGER NOT NULL DEFAULT 0,
        "salaryHigh" INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT '$'
      );
    `);
    console.log("✅ requests table initialized with all new fields");

    // --- NEW: consultations table ---
    await pool.query("DROP TABLE IF EXISTS consultations;");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS consultations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        company TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        "submittedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log("✅ consultations table initialized");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
