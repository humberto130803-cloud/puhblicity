/**
 * Applies supabase/migrations/*.sql in filename order.
 *
 *   node scripts/migrate.mjs
 *
 * Tracked in puhb_schema_migrations — deliberately NOT the shared
 * schema_migrations table, so SOLMATE's tooling (including its --reset)
 * never sees or manages PUHBLICITY objects. No --reset here at all: this
 * database holds live money records once launched.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connect } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIR = path.join(__dirname, "..", "supabase", "migrations");

const client = await connect();

await client.query(`
  create table if not exists public.puhb_schema_migrations (
    name text primary key,
    applied_at timestamptz not null default now()
  )
`);

const { rows: done } = await client.query(`select name from public.puhb_schema_migrations`);
const applied = new Set(done.map((r) => r.name));

const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".sql")).sort();
let ran = 0;

for (const file of files) {
  if (applied.has(file)) {
    console.log(`  skip  ${file}`);
    continue;
  }
  const sql = fs.readFileSync(path.join(DIR, file), "utf8");
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query(`insert into public.puhb_schema_migrations (name) values ($1)`, [file]);
    await client.query("commit");
    console.log(`  ok    ${file}`);
    ran++;
  } catch (e) {
    await client.query("rollback").catch(() => {});
    console.error(`  FAIL  ${file}\n        ${e.message}`);
    await client.end();
    process.exit(1);
  }
}

console.log(`\n${ran} migration(s) applied, ${files.length - ran} already current.`);
await client.end();
