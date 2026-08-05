/**
 * Pre-flight: everything you'd want to know before touching real money.
 *   node scripts/status.mjs
 */
import { Connection, PublicKey } from "@solana/web3.js";
import { connect, readEnv } from "./db.mjs";

const env = readEnv();
const sol = (l) => (Number(l) / 1e9).toFixed(4);

const conn = new Connection(env.RPC_URL, "confirmed");
const vault = new PublicKey(env.NEXT_PUBLIC_VAULT_PUBKEY);
const admin = new PublicKey(env.ADMIN_WALLET);

const [vaultBal, adminBal] = await Promise.all([
  conn.getBalance(vault),
  conn.getBalance(admin),
]);

const c = await connect({ quiet: true });
const one = async (q) => (await c.query(q)).rows[0];
const settings = await one("select paused, max_total_open_pot from puhb_settings where id=1");
const dares = await one("select count(*)::int n from puhb_dares");
const owed = await one(
  "select coalesce(sum(lamports),0)::bigint s from puhb_pledges where refund_status in ('DUE','SENDING','FAILED')"
);
const cats = await one("select count(*)::int n from puhb_categories where active");
await c.end();

console.log("\n  VAULT   ", sol(vaultBal), "SOL  ", env.NEXT_PUBLIC_VAULT_PUBKEY);
console.log("  YOUR WALLET", sol(adminBal), "SOL  ", env.ADMIN_WALLET);
console.log("\n  paused:        ", settings.paused);
console.log("  dares on board:", dares.n);
console.log("  refunds owed:  ", sol(owed.s), "SOL");
console.log("  live dares:    ", cats.n, "categories");

const need = 0.07;
const have = adminBal / 1e9;
console.log(
  "\n  test needs ~" + need + " SOL free in your wallet:",
  have >= need ? "OK (" + sol(adminBal) + ")" : "SHORT — only " + sol(adminBal)
);
console.log();
