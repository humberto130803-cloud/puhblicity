"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Rv } from "@/components/reveal";
import { useAuth } from "@/components/providers";
import { useConnectOrSignIn } from "@/components/use-connect";
import { payVault } from "@/components/solana-tx";
import { parseSolToLamports } from "@/lib/format";
import { useT } from "@/components/locale-provider";

type Category = {
  id: string;
  label: string;
  emoji: string;
  blurb: string;
  group_label: string;
};

/**
 * Group keys are the values stored in the database, so they stay English
 * here and get their display name from the dictionary.
 */
const GROUP_ORDER = ["Nerve", "Looks", "Taste", "Body", "Online"];

const TARGET_PRESETS = ["0.25", "0.50", "1.00", "2.50", "5.00"];
const FEE_LAMPORTS = 20_000_000n;
const FEE_CACHE_KEY = "puhb.feetx";
const CHECK_COUNT = 4;

export function CreateForm({
  categories,
  paused,
  vault,
}: {
  categories: Category[];
  paused: boolean;
  vault: string;
}) {
  const t = useT();
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
  const [checks, setChecks] = useState<boolean[]>(
    Array.from({ length: CHECK_COUNT }, () => false)
  );
  const [busy, setBusy] = useState(false);
  const [phase, setPhase] = useState("");
  const [error, setError] = useState<string | null>(null);

  const allChecked = checks.every(Boolean);

  async function submit() {
    setError(null);
    // Same guard as backing: a live session doesn't guarantee a wallet that
    // can sign, especially on a phone browser.
    if (!wallet.connected || !wallet.publicKey) {
      connect();
      return;
    }
    if (!categoryId) return setError(t.create.errPick);
    if (doerName.trim().length < 2) return setError(t.create.errName);
    const target = parseSolToLamports(targetSol);
    if (target === null || target < 250_000_000n || target > 5_000_000_000n) {
      return setError(t.create.errTarget);
    }
    if (!allChecked) return setError(t.create.errChecks);

    setBusy(true);
    try {
      let feeTx: { signature: string; nonce: string } | null = null;
      try {
        const cached = localStorage.getItem(FEE_CACHE_KEY);
        if (cached) feeTx = JSON.parse(cached);
      } catch { /* ignore */ }

      if (!feeTx) {
        setPhase(t.create.payingFee);
        const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) =>
          b.toString(16).padStart(2, "0")
        ).join("");
        const signature = await payVault(wallet, connection, vault, FEE_LAMPORTS, `PUHB:NEW:${nonce}`);
        feeTx = { signature, nonce };
        try { localStorage.setItem(FEE_CACHE_KEY, JSON.stringify(feeTx)); } catch { /* ignore */ }
      } else {
        setPhase(t.create.reusingFee);
      }

      setPhase(t.create.opening);
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
      setError(e instanceof Error ? e.message : t.create.genericErr);
      setBusy(false);
      setPhase("");
    }
  }

  if (paused) {
    return (
      <div className="wrap-narrow" style={{ padding: "44px 24px 90px" }}>
        <div className="notice" role="alert">
          <b>{t.create.pausedTitle}</b> {t.create.pausedBody}
        </div>
      </div>
    );
  }

  return (
    <div className="wrap-narrow" style={{ padding: "44px 24px 90px" }}>
      <Rv>
        <p className="eyebrow">{t.create.eyebrow}</p>
        <h1 className="h2" style={{ margin: "11px 0 13px" }}>{t.create.heading}</h1>
        <p className="lede muted">
          {t.create.lede}
        </p>
      </Rv>

      <Rv className="field" style={{ marginTop: 34 }}>
        <span className="label">{t.create.theDare}</span>
        <p className="hint" style={{ marginBottom: 4 }}>
          {t.create.count(categories.length)}
        </p>
        {GROUP_ORDER.filter((g) => categories.some((c) => c.group_label === g)).map((group) => (
          <div key={group} style={{ marginTop: 18 }}>
            <p className="eyebrow" style={{ marginBottom: 2 }}>{t.create.groups[group] ?? group}</p>
            <p className="hint" style={{ marginBottom: 10 }}>{t.create.groupBlurbs[group]}</p>
            <div className="catgrid" role="group" aria-label={t.create.groups[group] ?? group}>
              {categories
                .filter((c) => c.group_label === group)
                .map((c) => (
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
          </div>
        ))}
        <p className="hint" style={{ marginTop: 14 }}>
          {t.create.banned}
        </p>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="d">{t.create.specifics}</label>
        <p className="hint">{t.create.specificsHint}</p>
        <textarea
          className="textarea"
          id="d"
          maxLength={140}
          placeholder={t.create.specificsPlaceholder}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
        />
        <span className="counter">{detail.length} / 140</span>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="t">{t.create.target}</label>
        <p className="hint">{t.create.targetHint}</p>
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
          {t.create.targetRule}
        </p>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="w">{t.create.window}</label>
        <select
          className="select"
          id="w"
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
        >
          <option value={24}>{t.create.windows.h24}</option>
          <option value={72}>{t.create.windows.d3}</option>
          <option value={168}>{t.create.windows.d7}</option>
        </select>
      </Rv>

      <Rv className="field">
        <label className="label" htmlFor="n">{t.create.nameHandle}</label>
        <input
          className="input"
          id="n"
          maxLength={24}
          placeholder={t.create.namePlaceholder}
          value={doerName}
          onChange={(e) => setDoerName(e.target.value)}
          style={{ marginBottom: 9 }}
        />
        <input
          className="input"
          id="ig"
          maxLength={31}
          placeholder={t.create.igPlaceholder}
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
        <p className="hint">
          {t.create.walletHint}
        </p>
        {instagram.trim() && (
          <div className="notice notice-cool" style={{ marginTop: 10 }}>
            <b>Want the verified tick?</b> After you post, put your dare code
            in your Instagram bio for a few minutes. We check it by hand and
            mark the handle as really yours — that&apos;s what tells backers
            they&apos;re funding a person and not a stranger using someone
            else&apos;s name.
          </div>
        )}
      </Rv>

      <Rv className="card card-pad" style={{ marginTop: 30 }}>
        <p className="eyebrow">{t.create.before}</p>
        <div style={{ marginTop: 16 }}>
          {t.create.checks.map((text, i) => (
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
          <span>{t.create.fee}</span><b className="mono">0.02 SOL</b>
        </div>
        <div className="rowline">
          <span>{t.create.refundable}</span>
          <span className="mono muted">{t.create.refundableVal}</span>
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
            <span>{busy ? phase || t.create.working : t.create.submit}</span>
          </button>
        ) : (
          <button className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={connect}>
            <span>{t.create.connect}</span>
          </button>
        )}
        <p className="hint" style={{ marginTop: 11, textAlign: "center" }}>
          {t.create.firstDare}
        </p>
      </Rv>
    </div>
  );
}
