// Applies supabase/migrations/*.sql in order, once each.
// Usage: node --env-file=.env.local scripts/migrate.mjs
import { readdirSync, readFileSync } from "node:fs";
import pg from "pg";

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query("create table if not exists public._migrations (name text primary key, applied_at timestamptz default now())");
await client.query("alter table public._migrations enable row level security");
const done = new Set((await client.query("select name from public._migrations")).rows.map((r) => r.name));

for (const f of readdirSync("supabase/migrations").sort()) {
  if (done.has(f)) continue;
  const sql = readFileSync(`supabase/migrations/${f}`, "utf8");
  try {
    await client.query("begin");
    await client.query(sql);
    await client.query("insert into public._migrations (name) values ($1)", [f]);
    await client.query("commit");
    console.log("applied", f);
  } catch (e) {
    await client.query("rollback");
    console.error("failed", f, e.message);
    process.exitCode = 1;
    break;
  }
}
await client.end();
