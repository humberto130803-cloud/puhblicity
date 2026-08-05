"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { payVault } from "@/components/solana-tx";
import { parseSolToLamports } from "@/lib/format";

type Category = { id: string; label: string; emoji: string; blurb: string };

const TARGET_PRESETS = ["0.25", "0.5", "1", "2", "5"];
const WINDOWS = [
  { hours: 24, label: "24 hours" },
  { hours: 72, label: "3 days" },
  { hours: 168, label: "7 days" },
];
const FEE_LAMPORTS = 20_000_000n;

/**
 * A failed form POST after a paid fee must not cost a second fee: the
 * signature+nonce are kept in localStorage and reused on retry.
 */
const FEE_CACHE_KEY = "puhb.feetx";

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
  const [targetSol, setTargetSol] = useState("1");
  const [hours, setHours] = useState(72);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    if (!categoryId) return setError("Pick a dare from the menu.");
    if (doerName.trim().length < 2) return setError("Your name goes on the board — 2 to 24 characters.");
    const target = parseSolToLamports(targetSol);
    if (target === null || target < 250_000_000n || target > 5_000_000_000n) {
      return setError("Target must be between 0.25 and 5 SOL. The ceiling is the ceiling.");
    }
    if (!ageConfirmed) return setError("Confirm you're 18 or older.");

    setBusy(true);
    try {
      // Reuse a previously-paid fee if the form failed after payment.
      let feeTx: { signature: string; nonce: string } | null = null;
      try {
        const cached = localStorage.getItem(FEE_CACHE_KEY);
        if (cached) feeTx = JSON.parse(cached);
      } catch {
        /* ignore */
      }

      if (!feeTx) {
        setPhase("Paying the 0.02 SOL posting fee…");
        const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
          b.toString(16).padStart(2, "0")
        ).join("");
        const signature = await payVault(
          wallet,
          connection,
          vault,
          FEE_LAMPORTS,
          `PUHB:NEW:${nonce}`
        );
        feeTx = { signature, nonce };
        try {
          localStorage.setItem(FEE_CACHE_KEY, JSON.stringify(feeTx));
        } catch {
          /* ignore */
        }
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
          ageConfirmed,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // A consumed fee signature must not stay cached — it would loop the
        // form into the same 409 forever.
        if (res.status === 409) {
          try {
            localStorage.removeItem(FEE_CACHE_KEY);
          } catch {
            /* ignore */
          }
        }
        throw new Error(data.error ?? "Could not open the dare");
      }

      try {
        localStorage.removeItem(FEE_CACHE_KEY);
      } catch {
        /* ignore */
      }
      router.push(`/d/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something broke — your fee, if paid, is saved for retry.");
    } finally {
      setBusy(false);
      setPhase("");
    }
  }

  if (paused) {
    return (
      <div className="notice notice--warn" role="alert">
        PUHBLICITY is paused — no new dares right now. Money already pledged is unaffected.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 720, paddingBottom: 40 }}>
      <label className="field-label">The dare — pick from the menu</label>
      <p className="field-help" style={{ marginBottom: 8 }}>
        The menu is the moderation. Nothing dangerous, nothing aimed at
        anyone else, nothing we&apos;d be ashamed to review.
      </p>
      <div className="cat-grid" role="group" aria-label="Dare menu">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            className="cat-tile"
            aria-pressed={categoryId === c.id}
            onClick={() => setCategoryId(c.id)}
          >
            <span className="em">{c.emoji}</span>
            <strong>{c.label}</strong>
            <span className="blurb">Proof: {c.blurb}</span>
          </button>
        ))}
      </div>

      <label className="field-label" htmlFor="detail">
        Your twist <span style={{ color: "var(--slate)", fontWeight: 400 }}>(optional, {140 - detail.length} left)</span>
      </label>
      <textarea
        id="detail"
        rows={2}
        maxLength={140}
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        placeholder="Specifics inside your chosen dare. No links, no phone numbers, nobody else's name."
      />

      <label className="field-label" htmlFor="doerName">Your name on the board</label>
      <input
        id="doerName"
        type="text"
        maxLength={24}
        value={doerName}
        onChange={(e) => setDoerName(e.target.value)}
        placeholder="2–24 characters"
      />

      <label className="field-label" htmlFor="instagram">
        Instagram <span style={{ color: "var(--slate)", fontWeight: 400 }}>(optional — completed dares with a tagged post get featured)</span>
      </label>
      <input
        id="instagram"
        type="text"
        maxLength={31}
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
        placeholder="@you"
      />

      <label className="field-label">The target</label>
      <div className="choice-row">
        {TARGET_PRESETS.map((t) => (
          <button
            key={t}
            type="button"
            className="choice mono"
            aria-pressed={targetSol === t}
            onClick={() => setTargetSol(t)}
          >
            {t} SOL
          </button>
        ))}
        <input
          type="text"
          inputMode="decimal"
          value={targetSol}
          onChange={(e) => setTargetSol(e.target.value)}
          aria-label="Custom target in SOL"
          style={{ width: 110 }}
        />
      </div>
      <p className="field-help">0.25 minimum, 5 maximum. The ceiling keeps the number a joke, not a lever.</p>

      <label className="field-label">Funding window</label>
      <div className="choice-row">
        {WINDOWS.map((w) => (
          <button
            key={w.hours}
            type="button"
            className="choice"
            aria-pressed={hours === w.hours}
            onClick={() => setHours(w.hours)}
          >
            {w.label}
          </button>
        ))}
      </div>

      <label className="field-label" style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 400 }}>
        <input
          type="checkbox"
          checked={ageConfirmed}
          onChange={(e) => setAgeConfirmed(e.target.checked)}
          style={{ width: "auto" }}
        />
        I&apos;m 18 or older, this dare is mine alone, and I&apos;ve read the{" "}
        <a href="/terms" target="_blank">terms</a>.
      </label>

      <div className="notice" style={{ margin: "16px 0" }}>
        Payouts go to the wallet you&apos;re connected with. Use a wallet you
        control, not an exchange address. The 0.02 SOL posting fee is
        non-refundable. If your target is hit, you get the pot minus 10% once
        your proof is approved. First dare from a wallet gets a quick human
        check before it appears on the board.
      </div>

      {session ? (
        <button className="btn btn--flare" onClick={() => void submit()} disabled={busy}>
          {busy ? phase || "Working…" : "Pay 0.02 SOL & open the dare"}
        </button>
      ) : (
        <button className="btn btn--flare" onClick={connect}>
          Connect to open a dare
        </button>
      )}
      {error && (
        <div className="notice notice--error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
