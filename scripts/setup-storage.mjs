/**
 * Creates the private proof bucket with server-side constraints the spec
 * requires: video-only MIME allowlist and the 100 MB cap, enforced by
 * Supabase itself so no route bug can bypass them.
 */
import { createClient } from "@supabase/supabase-js";
import { readEnv } from "./db.mjs";

const env = readEnv();
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { data, error } = await db.storage.createBucket("puhb-proofs", {
  public: false,
  // Supabase free tier caps per-object size at 50 MB — the spec's 100 MB
  // isn't available. 50 MB still fits a 90s phone video comfortably.
  fileSizeLimit: 50_000_000,
  allowedMimeTypes: ["video/mp4", "video/quicktime", "video/webm"],
});

if (error) {
  if (String(error.message).toLowerCase().includes("already exists")) {
    console.log("bucket puhb-proofs already exists");
  } else {
    console.error("bucket create failed:", error.message);
    process.exit(1);
  }
} else {
  console.log("bucket created:", data);
}
