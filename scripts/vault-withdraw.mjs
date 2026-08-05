/**
 * Move SOL out of the vault to a destination wallet.
 *
 *   node scripts/vault-withdraw.mjs <destination> <SOL amount>
 *
 * Operator tool, run by hand, never on a schedule. Refuses to leave the
 * vault unable to cover what it currently owes in refunds — the one way a
 * withdrawal here could hurt somebody who isn't the operator.
 */
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction } from "@solana/web3.js";
import { connect, readEnv } from "./db.mjs";

const [, , dest, amountSol] = process.argv;
if (!dest || !amountSol) {
  console.error("usage: node scripts/vault-withdraw.mjs <destination> <SOL>");
  process.exit(1);
}

const env = readEnv();
const conn = new Connection(env.RPC_URL, "confirmed");
const kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(env.VAULT_SECRET_KEY)));
const to = new PublicKey(dest);
const lamports = BigInt(Math.round(Number(amountSol) * 1e9));

const balance = BigInt(await conn.getBalance(kp.publicKey));

// What do we owe right now? Never withdraw into that.
const c = await connect({ quiet: true });
const { rows } = await c.query(
  "select coalesce(sum(lamports),0)::bigint s from puhb_pledges where refund_status in ('DUE','SENDING','FAILED')"
);
const { rows: pots } = await c.query(
  "select coalesce(sum(pot_lamports),0)::bigint s from puhb_dares where status in ('OPEN','CLOSED','IN_REVIEW','REFUNDING')"
);
await c.end();

const owed = BigInt(rows[0].s) + BigInt(pots[0].s);
const RENT_FLOOR = 2_000_000n; // comfortably above rent exemption, plus fees
const free = balance - owed - RENT_FLOOR;

const fmt = (l) => (Number(l) / 1e9).toFixed(6);
console.log(`  vault balance   ${fmt(balance)} SOL`);
console.log(`  owed to users   ${fmt(owed)} SOL  (live pots + pending refunds)`);
console.log(`  withdrawable    ${fmt(free > 0n ? free : 0n)} SOL`);

if (lamports > free) {
  console.error(`\n  REFUSED: ${fmt(lamports)} would dip into money owed to users.`);
  process.exit(1);
}

const tx = new Transaction()
  .add(SystemProgram.transfer({ fromPubkey: kp.publicKey, toPubkey: to, lamports }))
  .add(
    new TransactionInstruction({
      keys: [],
      programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
      data: Buffer.from("PUHB:OPWITHDRAW", "utf8"),
    })
  );

const latest = await conn.getLatestBlockhash("confirmed");
tx.recentBlockhash = latest.blockhash;
tx.feePayer = kp.publicKey;
tx.sign(kp);

const sig = await conn.sendRawTransaction(tx.serialize());
await conn.confirmTransaction({ signature: sig, ...latest }, "confirmed");

console.log(`\n  sent ${fmt(lamports)} SOL -> ${dest}`);
console.log(`  ${sig}`);
console.log(`  https://solscan.io/tx/${sig}`);
console.log(`  vault now ${fmt(BigInt(await conn.getBalance(kp.publicKey)))} SOL`);
