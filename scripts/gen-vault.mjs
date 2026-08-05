/**
 * Generates the platform vault keypair, writes it into .env.local, and
 * upserts the puhb_settings row with the vault pubkey.
 *
 * The secret key goes ONLY into .env.local (gitignored) and, at deploy time,
 * into Vercel env vars. It is never printed in full to the console and never
 * written anywhere else. Idempotent: refuses to overwrite an existing vault.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Keypair } from "@solana/web3.js";
import { connect, readEnv } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env.local");

const env = readEnv();
if (env.VAULT_SECRET_KEY && env.VAULT_SECRET_KEY.length > 10) {
  console.log(`vault already exists: ${env.NEXT_PUBLIC_VAULT_PUBKEY}`);
  console.log("refusing to overwrite. Delete the env lines manually if you truly mean it.");
  process.exit(0);
}

const kp = Keypair.generate();
const pub = kp.publicKey.toBase58();
const secret = JSON.stringify(Array.from(kp.secretKey));

let envFile = fs.readFileSync(ENV_PATH, "utf8");
envFile = envFile
  .replace(/^NEXT_PUBLIC_VAULT_PUBKEY=.*$/m, `NEXT_PUBLIC_VAULT_PUBKEY=${pub}`)
  .replace(/^VAULT_SECRET_KEY=.*$/m, `VAULT_SECRET_KEY=${secret}`);
fs.writeFileSync(ENV_PATH, envFile);

const client = await connect({ quiet: true });
await client.query(
  `insert into puhb_settings (id, paused, vault_pubkey) values (1, false, $1)
   on conflict (id) do update set vault_pubkey = excluded.vault_pubkey`,
  [pub]
);
await client.end();

console.log(`vault created: ${pub}`);
console.log("secret written to .env.local only. Back it up somewhere safe offline.");
