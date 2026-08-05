/**
 * Postgres connection to the shared SOLMATE/Ascending Supabase project.
 * Ported from solmate/scripts/db.mjs — direct host first, then Supavisor
 * pooler regions, because the direct DB host is IPv6-only on some networks.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = "qcilxvosttzmednqlilu";

export function readEnv() {
  const envFile = fs
    .readFileSync(path.join(__dirname, "..", ".env.local"), "utf8")
    .replace(/^﻿/, "");
  return Object.fromEntries(
    envFile
      .split(/\r?\n/)
      .filter((l) => l.includes("=") && !l.startsWith("#"))
      .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
  );
}

const REGIONS = [
  "us-east-1", "us-east-2", "sa-east-1", "us-west-1", "us-west-2",
  "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
  "ap-southeast-1", "ap-south-1",
];

/** Connect, trying direct then pooler. Returns a connected pg.Client. */
export async function connect({ quiet = false } = {}) {
  const password = readEnv().SUPABASE_DB_PASSWORD;
  if (!password) throw new Error("SUPABASE_DB_PASSWORD missing from .env.local");

  const candidates = [
    { host: `db.${PROJECT_REF}.supabase.co`, port: 5432, user: "postgres" },
    ...REGIONS.flatMap((r) => [
      { host: `aws-1-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
      { host: `aws-0-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${PROJECT_REF}` },
    ]),
  ];

  let lastErr = null;
  for (const c of candidates) {
    const attempt = new pg.Client({
      ...c,
      database: "postgres",
      password,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 6000,
    });
    attempt.on("error", () => {});
    try {
      await attempt.connect();
      await attempt.query("select 1");
      if (!quiet) console.log(`connected via ${c.host}`);
      return attempt;
    } catch (e) {
      lastErr = e;
      await attempt.end().catch(() => {});
    }
  }
  throw lastErr;
}
