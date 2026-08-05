// One-off: mark the operator's 0.05 SOL fee-buffer deposit as resolved so it
// doesn't sit in the admin orphan queue looking like a problem.
import { connect } from "./db.mjs";

const SIG =
  "PsgvJUdA9KxZVRRjy8MSEvWxQtQDomZvEKsfE9oS7wRojLNRgFeJjkqBte6jXZE4VUMYnq6XbQZ2gGqZpEMkiBg";

const c = await connect({ quiet: true });
await c.query(
  "update puhb_orphan_payments set resolved = true, note = $1 where signature = $2",
  ["vault fee buffer from H — keep, do not send back", SIG]
);
await c.query(
  "insert into puhb_admin_log (actor, action, dare_id, detail) values ('system', 'orphan_resolved_as_buffer', null, $1)",
  [JSON.stringify({ lamports: 50000000, signature: SIG })]
);
console.log("marked as buffer");
await c.end();
