"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Paperclip, Upload, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ExtractedInvoice } from "@/lib/invoice-extract";

interface Props {
  initialRemaining: number;
  max: number;
}

type State = "idle" | "uploading" | "done" | "exhausted";

function fmt(n: number | null, currency: string | null) {
  if (n == null) return null;
  const sym = currency && currency.length <= 3 ? `${currency} ` : "";
  return `${sym}${n.toFixed(2)}`;
}

export function DemoForm({ initialRemaining, max }: Props) {
  const [remaining, setRemaining] = useState(initialRemaining);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<State>(
    initialRemaining <= 0 ? "exhausted" : "idle",
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractedInvoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || state === "uploading") return;

    setState("uploading");
    setError(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/demo", { method: "POST", body: form });
      const data = (await res.json()) as {
        extracted?: ExtractedInvoice;
        remaining?: number;
        error?: string;
      };

      if (res.status === 429 || data.error === "trial_exhausted") {
        setRemaining(0);
        setState("exhausted");
        return;
      }

      if (!res.ok || !data.extracted) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setState("idle");
        return;
      }

      setResult(data.extracted);
      setRemaining(data.remaining ?? 0);
      setState("done");
    } catch {
      setError("Network error. Please check your connection and try again.");
      setState("idle");
    }
  }

  // ── Exhausted ──────────────────────────────────────────────────────────────
  if (state === "exhausted") {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-strong p-8 text-center">
        <p className="text-base font-semibold text-white">
          You&apos;ve used all {max} free extractions
        </p>
        <p className="mt-2 text-sm text-muted">
          Ready to automate this for your whole business?
        </p>
        <Link
          href="/#contact"
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:border-accent/45"
        >
          Book a free consultation
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    );
  }

  // ── Result ─────────────────────────────────────────────────────────────────
  if (state === "done" && result) {
    const c = result.currency;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-surface-strong p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Extracted fields</p>
            <span className="font-mono text-xs text-muted">
              {remaining} extraction{remaining !== 1 ? "s" : ""} left
            </span>
          </div>

          <dl className="space-y-2 text-sm">
            {[
              ["Vendor", result.vendor_name],
              ["Invoice #", result.invoice_number],
              ["Invoice date", result.invoice_date],
              ["Due date", result.due_date],
              ["Subtotal", fmt(result.subtotal, c)],
              ["Tax", fmt(result.tax, c)],
              ["Total", fmt(result.total, c)],
              ["Currency", result.currency],
            ].map(([label, value]) =>
              value ? (
                <div key={label} className="flex justify-between gap-4">
                  <dt className="text-muted">{label}</dt>
                  <dd className="text-right font-medium text-white">{value}</dd>
                </div>
              ) : null,
            )}
          </dl>

          {result.line_items.length > 0 && (
            <div className="mt-4 border-t border-white/8 pt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                Line items
              </p>
              <div className="space-y-1.5">
                {result.line_items.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between gap-3 text-sm"
                  >
                    <span className="text-muted-strong">{item.description}</span>
                    {item.amount != null && (
                      <span className="shrink-0 font-medium text-white">
                        {fmt(item.amount, c)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.notes && (
            <p className="mt-3 border-t border-white/8 pt-3 text-xs text-muted">
              {result.notes}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          {remaining > 0 ? (
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
                setState("idle");
              }}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:border-accent/45"
            >
              Try another invoice
            </button>
          ) : null}
          <Link
            href="/#contact"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-3 text-sm font-semibold text-accent hover:-translate-y-0.5 hover:bg-accent/15"
          >
            Automate this
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </div>
    );
  }

  // ── Upload form ────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-surface-strong p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-white">Upload an invoice</p>
          <span className="font-mono text-xs text-muted">
            {remaining} of {max} free extraction{max !== 1 ? "s" : ""} remaining
          </span>
        </div>

        {/* Usage dots */}
        <div className="mb-5 flex gap-1.5">
          {Array.from({ length: max }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i < max - remaining ? "bg-white/15" : "bg-accent",
              )}
            />
          ))}
        </div>

        {/* Drop zone */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "w-full rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
            isDragging
              ? "border-accent bg-accent/5"
              : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]",
          )}
        >
          {file ? (
            <div className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-4 py-3 text-left text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <Paperclip className="size-4 shrink-0 text-accent" />
                <span className="truncate text-white">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="shrink-0 text-muted hover:text-white"
                aria-label="Remove file"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="mx-auto mb-3 size-8 text-muted" />
              <p className="text-sm font-medium text-white">
                Drop your invoice here
              </p>
              <p className="mt-1 text-xs text-muted">
                PDF, JPG, PNG, WEBP · max 10 MB
              </p>
            </>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) setFile(f); }}
        />
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || state === "uploading"}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white hover:-translate-y-0.5 hover:border-accent/45 hover:bg-white/[0.1] disabled:pointer-events-none disabled:opacity-40"
      >
        {state === "uploading" ? "Extracting…" : "Extract invoice data"}
        {state !== "uploading" && <ArrowUpRight className="size-4" />}
      </button>
    </form>
  );
}
