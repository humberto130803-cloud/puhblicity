"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Rv } from "@/components/reveal";
import { Clock } from "@/components/clock";
import { browserSupabase } from "@/components/supabase-browser";
import { formatSol } from "@/lib/format";
import { useT } from "@/components/locale-provider";
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
  const t = useT();
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
    if (!ALLOWED.includes(f.type)) { setError(t.prove.errType); return; }
    if (f.size > MAX_BYTES) { setError(t.prove.errSize); return; }
    setFile(f);
  }

  async function submit() {
    setError(null);
    if (!file) { setError(t.prove.errPick); return; }
    setBusy(true);
    try {
      setProgress(t.prove.checking);
      const dur = await videoDuration(file);
      if (dur > MAX_SECONDS + 1) {
        throw new Error(t.prove.errLong(MAX_SECONDS, Math.round(dur)));
      }
      setProgress(t.prove.slot);
      const startRes = await fetch("/api/proof/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dareId: dare.id, mime: file.type }),
      });
      const start = await startRes.json();
      if (!startRes.ok) throw new Error(start.error ?? "Could not start upload");

      setProgress(t.prove.uploading);
      const { error: upErr } = await browserSupabase()
        .storage.from("puhb-proofs")
        .uploadToSignedUrl(start.path, start.token, file, { contentType: file.type });
      if (upErr) throw new Error(upErr.message);

      setProgress(t.prove.finishing);
      const doneRes = await fetch("/api/proof/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dareId: dare.id, path: start.path, note: note.trim() || undefined }),
      });
      const done = await doneRes.json();
      if (!doneRes.ok) throw new Error(done.error ?? "Could not submit proof");

      router.push(`/d/${dare.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t.prove.failed);
      setProgress("");
      setBusy(false);
    }
  }

  return (
    <div className="wrap-narrow" style={{ padding: "44px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">{dare.id} · {dare.category_label}</p>
        <h1 className="h2" style={{ margin: "11px 0 13px" }}>
          {dare.status === "CLOSED" ? t.prove.heading : t.prove.headingReplace}
        </h1>
        <p className="lede muted">
          {t.prove.lede(formatSol(payout))}
        </p>
      </Rv>

      <Rv className="card card-pad" style={{ margin: "28px 0" }}>
        <div className="rowline"><span>{t.prove.pot}</span><b className="mono">{formatSol(pot)} SOL</b></div>
        <div className="rowline"><span>{t.prove.cut}</span><span className="mono">{formatSol(cut)}</span></div>
        <div className="rowline"><span>{t.prove.youGet}</span><b className="mono" style={{ color: "var(--jade)" }}>{formatSol(payout)} SOL</b></div>
        {dare.proof_due_at && dare.status === "CLOSED" && (
          <div className="rowline"><span>{t.prove.deadline}</span><Clock until={dare.proof_due_at} urgentUnderHours={12} /></div>
        )}
      </Rv>

      {/* The single thing that makes recycled footage impractical: a code
          that did not exist until this dare was funded. */}
      <Rv className="card card-pad" style={{ borderColor: "var(--flare)", boxShadow: "6px 6px 0 var(--flare)" }}>
        <p className="eyebrow">{t.prove.codeEyebrow}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", margin: "12px 0 10px" }}>
          <span
            className="mono"
            style={{
              fontSize: 30, letterSpacing: ".16em", background: "var(--ink)",
              color: "var(--gold)", padding: "10px 16px", borderRadius: 3,
            }}
          >
            {dare.id}
          </span>
          <span style={{ fontSize: 15, flex: 1, minWidth: 200 }}>
            {t.prove.codeBody}
          </span>
        </div>
        <p className="hint">
          {t.prove.codeHint}
        </p>
      </Rv>

      <Rv className="card card-pad" style={{ marginTop: 22 }}>
        <p className="eyebrow">{t.prove.needToSee}</p>
        <p style={{ marginTop: 9 }}>
          {dare.category_blurb}{" "}
          {t.prove.needTail}
        </p>
      </Rv>

      <Rv className="field" style={{ marginTop: 26 }}>
        <span className="label">{t.prove.theVideo}</span>
        <div
          className={`dropzone${drag ? " is-drag" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
        >
          <p className="h3">{file ? file.name : t.prove.drop}</p>
          <p className="hint" style={{ margin: "7px 0 16px" }}>
            {file
              ? t.prove.looksGood((file.size / 1_000_000).toFixed(1))
              : t.prove.dropHint}
          </p>
          <button className="btn btn-sm" type="button" onClick={() => fileRef.current?.click()}>
            <span>{file ? t.prove.chooseOther : t.prove.chooseFile}</span>
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
        <label className="label" htmlFor="pn">{t.prove.noteLabel}</label>
        <textarea
          className="textarea"
          id="pn"
          maxLength={200}
          placeholder={t.prove.notePlaceholder}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <span className="counter">{note.length} / 200</span>
      </Rv>

      <Rv className="notice notice-cool" style={{ marginBottom: 22 }}>
        <b>{t.prove.whoSees}</b> {t.prove.whoSeesBody}
      </Rv>

      {error && (
        <div className="notice" role="alert" style={{ marginBottom: 16 }}>{error}</div>
      )}

      <Rv>
        <button className="btn btn-primary btn-block" onClick={() => void submit()} disabled={busy}>
          <span>{busy ? progress || t.create.working : t.prove.submit}</span>
        </button>
        <p className="hint" style={{ marginTop: 11, textAlign: "center" }}>
          {t.prove.replaceHint}
        </p>
      </Rv>
    </div>
  );
}
