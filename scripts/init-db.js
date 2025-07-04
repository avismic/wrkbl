// scripts/init-db.js
const { openDb } = require("../lib/db");

(async () => {
  try {
    const db = await openDb();

    // -- jobs table --
    await db.exec(`DROP TABLE IF EXISTS jobs;`);
    await db.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        officeType TEXT NOT NULL,
        experienceLevel TEXT NOT NULL,
        employmentType TEXT NOT NULL,
        industry TEXT NOT NULL,
        visa INTEGER NOT NULL DEFAULT 0,
        benefits TEXT NOT NULL,
        skills TEXT NOT NULL,
        url TEXT NOT NULL,
        postedAt INTEGER NOT NULL,
        remote INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL DEFAULT 'j',
        salaryLow INTEGER NOT NULL DEFAULT 0,
        salaryHigh INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT '$'
      );
    `);
    console.log("✅ jobs table initialized with all new fields");

    // -- requests table --
    await db.exec(`DROP TABLE IF EXISTS requests;`);
    await db.exec(`
      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        city TEXT NOT NULL,
        country TEXT NOT NULL,
        officeType TEXT NOT NULL,
        experienceLevel TEXT NOT NULL,
        employmentType TEXT NOT NULL,
        industry TEXT NOT NULL,
        visa INTEGER NOT NULL DEFAULT 0,
        benefits TEXT NOT NULL,
        skills TEXT NOT NULL,
        url TEXT NOT NULL,
        postedAt INTEGER NOT NULL,
        remote INTEGER NOT NULL DEFAULT 0,
        type TEXT NOT NULL DEFAULT 'j',
        salaryLow INTEGER NOT NULL DEFAULT 0,
        salaryHigh INTEGER NOT NULL DEFAULT 0,
        currency TEXT NOT NULL DEFAULT '$'
      );
    `);
    console.log("✅ requests table initialized with all new fields");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
