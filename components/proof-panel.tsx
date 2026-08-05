"use client";

import { useRef, useState } from "react";
import { browserSupabase } from "@/components/supabase-browser";
import type { PublicDare } from "@/lib/dares";

const MAX_SECONDS = 90;
const MAX_BYTES = 50_000_000;
const ALLOWED = ["video/mp4", "video/quicktime", "video/webm"];

/** Read a video file's duration in the browser before uploading. */
function videoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that video"));
    };
    v.src = url;
  });
}

export function ProofPanel({ dare, onDone }: { dare: PublicDare; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function upload() {
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Pick the video first.");
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setError("Video only: mp4, mov, or webm.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Over 50 MB — trim or compress it.");
      return;
    }
    setBusy(true);
    try {
      setProgress("Checking the video…");
      const dur = await videoDuration(file);
      if (dur > MAX_SECONDS + 1) {
        throw new Error(`Max ${MAX_SECONDS} seconds — yours is ${Math.round(dur)}s. One take, tight cut.`);
      }

      setProgress("Getting an upload slot…");
      const startRes = await fetch("/api/proof/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dareId: dare.id, mime: file.type }),
      });
      const start = await startRes.json();
      if (!startRes.ok) throw new Error(start.error ?? "Could not start upload");

      setProgress("Uploading…");
      const { error: upErr } = await browserSupabase()
        .storage.from("puhb-proofs")
        .uploadToSignedUrl(start.path, start.token, file, { contentType: file.type });
      if (upErr) throw new Error(upErr.message);

      setProgress("Finishing…");
      const doneRes = await fetch("/api/proof/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dareId: dare.id, path: start.path, note: note.trim() || undefined }),
      });
      const done = await doneRes.json();
      if (!doneRes.ok) throw new Error(done.error ?? "Could not submit proof");

      setProgress("");
      onDone();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed — try again.");
      setProgress("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel" style={{ padding: 20, marginTop: 22 }} aria-label="Upload proof">
      <p className="eyebrow">
        {dare.status === "CLOSED" ? "Upload your proof" : "Replace your proof (in review)"}
      </p>
      <p className="field-help" style={{ margin: "6px 0 12px" }}>
        What counts: {dare.category_blurb} Max 90 seconds, 50 MB, one video.
        If this gets approved, your backers can watch it on the dare page.
        After payout you can ask us to delete the video — see the privacy page.
      </p>
      <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm" aria-label="Proof video" />
      <input
        type="text"
        placeholder="Note for the reviewer (optional, 200 chars)"
        maxLength={200}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        style={{ margin: "10px 0" }}
        aria-label="Note for review"
      />
      <button className="btn btn--jade" onClick={() => void upload()} disabled={busy}>
        {busy ? progress || "Working…" : "Submit proof"}
      </button>
      {error && (
        <div className="notice notice--error" role="alert" style={{ marginTop: 10 }}>
          {error}
        </div>
      )}
    </section>
  );
}
