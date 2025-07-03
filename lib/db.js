// lib/db.js
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

let dbPromise;
function openDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: "./mydb.sqlite",
      driver: sqlite3.Database,
    });
  }
  return dbPromise;
}

module.exports = { openDb };
