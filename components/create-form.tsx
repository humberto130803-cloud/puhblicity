"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Rv } from "@/components/reveal";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { payVault } from "@/components/solana-tx";
import { parseSolToLamports } from "@/lib/format";

type Category = { id: string; label: string; emoji: string; blurb: string };

const TARGET_PRESETS = ["0.25", "0.50", "1.00", "2.50", "5.00"];
const WINDOWS = [
  { hours: 24, label: "24 hours" },
  { hours: 72, label: "3 days" },
  { hours: 168, label: "7 days" },
];
const FEE_LAMPORTS = 20_000_000n;
const FEE_CACHE_KEY = "puhb.feetx";

const CHECKS = [
  "I'm 18 or over, and this is my dare — nobody is making me do it.",
  "If my target hits, I have 48 hours to upload one video. If I don't, backers are refunded and I keep nothing.",
  "Nobody else appears in my video without agreeing to it.",
  "I understand PUHBLICITY holds the pot until the dare settles, and takes 10% only if I'm paid.",
];

export function CreateForm({
  categories,
  paused,
  vault,
}: {
  categories: Category[];
  paused: boolean;
  vault: string;
}) {
  const router = useRouter();
  const { session } = useAuth();
  const connect = useConnectOrSignIn();
  const wallet = useWallet();
  const { connection } = useConnection();

  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [detail, setDetail] = useState("");
  const [doerName, setDoerName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [targetSol, setTargetSol] = useState("1.00");
  const [hours, setHours] = useState(72);
  const [checks, setChecks] = useState<boolean[]>(CHECKS.map(() => false));
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<string | null>(null);

  const allChecked = checks.every(Boolean);

  async function submit() {
    setError(null);
    if (!categoryId) return setError("Pick a dare from the menu.");
    if (doerName.trim().length < 2) return setError("Your name goes on the board — 2 to 24 characters.");
    const target = parseSolToLamports(targetSol);
    if (target === null || target < 250_000_000n || target > 5_000_000_000n) {
      return setError("Target must be between 0.25 and 5.00 SOL. The ceiling is the ceiling.");
    }
    if (!allChecked) return setError("Tick all four boxes — they're the whole deal.");

    setBusy(true);
    try {
      let feeTx: { signature: string; nonce: string } | null = null;
      try {
        const cached = localStorage.getItem(FEE_CACHE_KEY);
        if (cached) feeTx = JSON.parse(cached);
      } catch { /* ignore */ }

      if (!feeTx) {
        setPhase("Paying the 0.02 SOL posting fee…");
        const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
          b.toString(16).padStart(2, "0")
        ).join("");
        const signature = await payVault(wallet, connection, vault, FEE_LAMPORTS, `PUHB:NEW:${nonce}`);
        feeTx = { signature, nonce };
        try { localStorage.setItem(FEE_CACHE_KEY, JSON.stringify(feeTx)); } catch { /* ignore */ }
      } else {
        setPhase("Reusing your already-paid posting fee…");
      }

      setPhase("Opening the dare…");
      const res = await fetch("/api/dares/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signature: feeTx.signature,
          nonce: feeTx.nonce,
          doerName: doerName.trim(),
          instagram: instagram.trim() || undefined,
          categoryId,
          detail: detail.trim(),
          targetLamports: target.toString(),
          fundingHours: hours,
          ageConfirmed: allChecked,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) {
          try { localStorage.removeItem(FEE_CACHE_KEY); } catch { /* ignore */ }
        }
        throw new Error(data.error ?? "Could not open the dare");
      }
      try { localStorage.removeItem(FEE_CACHE_KEY); } catch { /* ignore */ }
      router.push(`/d/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something broke — your fee, if paid, is saved for retry.");
      setBusy(false);
      setPhase("");
    }
  }

  if (paused) {
    return (
      <div className="wrap-narrow" style={{ padding: "44px 24px 90px" }}>
        <div className="notice" role="alert">
          <b>Paused.</b> No new dares right now. Money already pledged is unaffected.
        </div>
      </div>
    );
  }

  return (
    <div className="wrap-narrow" style={{ padding: "44px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">Post a dare</p>
        <h1 className="h2" style={{ margin: "11px 0 13px" }}>What will you do?</h1>
        <p className="lede muted">
          Pick from the menu. You can&apos;t invent one — the menu is how we keep
          this fun instead of dangerous.
        </p>
      </Rv>

      <Rv className="field" style={{ marginTop: 34 }}>
        <span className="label">The dare</span>
        <div className="catgrid" role="group" aria-label="Dare menu">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              className="cat"
              aria-pressed={categoryId === c.id}
              onClick={() => setCategoryId(c.id)}
            >
              <em>{c.emoji}</em>
              <b>{c.label}</b>
              <i>{c.blurb}</i>
            </button>
          ))}
        </div>
        <p className="hint">
          Nothing involving heights, vehicles, fire, alcohol, or anyone who
          hasn&apos;t agreed to be in it. That&apos;s the whole moderation policy, built
          into the menu.
        </p>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="d">Your specifics</label>
        <p className="hint">The bit that makes it yours. Keep it about you — no links, no phone numbers, nobody else&apos;s name.</p>
        <textarea
          className="textarea"
          id="d"
          maxLength={140}
          placeholder="No milk on the table. My roommate films it and she is not going to help me."
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <span className="counter">{detail.length} / 140</span>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="t">Your target</label>
        <p className="hint">The least you&apos;ll do it for. Under this by the deadline and everyone&apos;s refunded.</p>
        <input
          className="input mono"
          id="t"
          inputMode="decimal"
          value={targetSol}
          onChange={(e) => setTargetSol(e.target.value)}
        />
        <div className="amountrow">
          {TARGET_PRESETS.map((t) => (
            <button key={t} type="button" className="btn btn-sm" onClick={() => setTargetSol(t)}>
              <span>{t}</span>
            </button>
          ))}
        </div>
        <p className="hint">
          Between 0.25 and 5.00 SOL. The ceiling is 5 and it does not move.
          Low targets fill — that&apos;s how you get on the board.
        </p>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="w">Funding window</label>
        <select
          className="select"
          id="w"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
        >
          {WINDOWS.map((w) => (
            <option key={w.hours} value={w.hours}>{w.label}</option>
          ))}
        </select>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="n">Your name and handle</label>
        <input
          className="input"
          id="n"
          maxLength={24}
          placeholder="Your name on the board"
          value={doerName}
          onChange={(e) => setDoerName(e.target.value)}
          style={{ marginBottom: 9 }}
        />
        <input
          className="input"
          id="ig"
          maxLength={31}
          placeholder="@instagram (optional)"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
        <p className="hint">
          Payouts go to the wallet you&apos;re connected with. Use a wallet you
          control — not an exchange address.
        </p>
      </Rv>

      <Rv className="card card-pad" style={{ marginTop: 30 }}>
        <p className="eyebrow">Before you post</p>
        <div style={{ marginTop: 16 }}>
          {CHECKS.map((text, i) => (
            <label className="checkline" key={i}>
              <input
                type="checkbox"
                checked={checks[i]}
                onChange={(e) =>
                  setChecks((prev) => prev.map((v, n) => (n === i ? e.target.checked : v)))
                }
              />
              {text}
            </label>
          ))}
        </div>
        <div className="rowline" style={{ marginTop: 16 }}>
          <span>Posting fee</span><b className="mono">0.02 SOL</b>
        </div>
        <div className="rowline">
          <span>Refundable?</span>
          <span className="mono muted">No — it&apos;s what keeps spam off the board</span>
        </div>
        {error && (
          <div className="notice" role="alert" style={{ marginTop: 16 }}>{error}</div>
        )}
        {session ? (
          <button
            className="btn btn-primary btn-block"
            style={{ marginTop: 20 }}
            onClick={() => void submit()}
            disabled={busy}
          >
            <span>{busy ? phase || "Working…" : "Pay 0.02 SOL and post"}</span>
          </button>
        ) : (
          <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={connect}>
            <span>Connect to post</span>
          </button>
        )}
        <p className="hint" style={{ marginTop: 11, textAlign: "center" }}>
          First dare from a new wallet gets a quick look from us before it
          hits the board. Usually minutes.
        </p>
      </Rv>
    </div>
  );
}
