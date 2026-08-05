"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Rv } from "@/components/reveal";
import { Clock } from "@/components/clock";
import { browserSupabase } from "@/components/supabase-browser";
import { formatSol } from "@/lib/format";
import type { PublicDare } from "@/lib/dares";

const MAX_SECONDS = 90;
const MAX_BYTES = 50_000_000;
const ALLOWED = ["video/mp4", "video/quicktime", "video/webm"];

function videoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => { URL.revokeObjectURL(url); resolve(v.duration); };
    v.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Could not read that video")); };
    v.src = url;
  });
}

export function ProveForm({ dare }: { dare: PublicDare }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  const pot = BigInt(dare.pot);
  const payout = (pot * 9000n) / 10000n;
  const cut = pot - payout;

  function pick(f: File | undefined | null) {
    setError(null);
    if (!f) return;
    if (!ALLOWED.includes(f.type)) { setError("Video only: MP4, MOV or WebM."); return; }
    if (f.size > MAX_BYTES) { setError("Over 50 MB — trim or compress it."); return; }
    setFile(f);
  }

  async function submit() {
    setError(null);
    if (!file) { setError("Pick the video first."); return; }
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

      router.push(`/d/${dare.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed — try again.");
      setProgress("");
      setBusy(false);
    }
  }

  return (
    <div className="wrap-narrow" style={{ padding: "44px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">{dare.id} · {dare.category_label}</p>
        <h1 className="h2" style={{ margin: "11px 0 13px" }}>
          {dare.status === "CLOSED" ? "Send your proof" : "Replace your proof"}
        </h1>
        <p className="lede muted">
          One video. We watch it, then {formatSol(payout)} SOL goes to your wallet.
        </p>
      </Rv>

      <Rv className="card card-pad" style={{ margin: "28px 0" }}>
        <div className="rowline"><span>Pot</span><b className="mono">{formatSol(pot)} SOL</b></div>
        <div className="rowline"><span>Our cut (10%)</span><span className="mono">{formatSol(cut)}</span></div>
        <div className="rowline"><span>You receive</span><b className="mono" style={{ color: "var(--jade)" }}>{formatSol(payout)} SOL</b></div>
        {dare.proof_due_at && dare.status === "CLOSED" && (
          <div className="rowline"><span>Deadline</span><Clock until={dare.proof_due_at} urgentUnderHours={12} /></div>
        )}
      </Rv>

      <Rv className="card card-pad">
        <p className="eyebrow">What we need to see</p>
        <p style={{ marginTop: 9 }}>
          {dare.category_blurb}{" "}
          No cuts, no edits. If it doesn&apos;t match the dare we&apos;ll reject it and
          refund your backers — you&apos;ll get one line telling you why.
        </p>
      </Rv>

      <Rv className="field" style={{ marginTop: 26 }}>
        <span className="label">The video</span>
        <div
          className={`dropzone${drag ? " is-drag" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        >
          <p className="h3">{file ? file.name : "Drop your video here"}</p>
          <p className="hint" style={{ margin: "7px 0 16px" }}>
            {file
              ? `${(file.size / 1_000_000).toFixed(1)} MB — looks good`
              : "MP4, MOV or WebM · up to 50 MB · up to 90 seconds"}
          </p>
          <button className="btn btn-sm" type="button" onClick={() => fileRef.current?.click()}>
            <span>{file ? "Choose a different file" : "Choose a file"}</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            style={{ display: "none" }}
            onChange={(e) => pick(e.target.files?.[0])}
            aria-label="Proof video"
          />
        </div>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="pn">Anything we should know (optional)</label>
        <textarea
          className="textarea"
          id="pn"
          maxLength={200}
          placeholder="The timer's visible at 0:12."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <span className="counter">{note.length} / 200</span>
      </Rv>

      <Rv className="notice notice-cool" style={{ marginBottom: 22 }}>
        <b>Who sees this.</b> Only us, until it&apos;s approved. Once you&apos;re paid,
        your backers can watch it on the dare page — that&apos;s what they paid
        for. You can ask us to delete the file any time after payout.
      </Rv>

      {error && (
        <div className="notice" role="alert" style={{ marginBottom: 16 }}>{error}</div>
      )}

      <Rv>
        <button className="btn btn-primary btn-block" onClick={() => void submit()} disabled={busy}>
          <span>{busy ? progress || "Working…" : "Send proof"}</span>
        </button>
        <p className="hint" style={{ marginTop: 11, textAlign: "center" }}>
          You can replace it any time before we review it. If we haven&apos;t
          reviewed within 24 hours, backers are refunded automatically.
        </p>
      </Rv>
    </div>
  );
}
