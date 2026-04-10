"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle, Paperclip, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "identity" | "file" | "success";

interface Props {
  token: string;
  label: string;
}

export function UploadForm({ token, label }: Props) {
  const [step, setStep] = useState<Step>("identity");
  const [vendorName, setVendorName] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 1 — identity
  function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!vendorName.trim() || !vendorEmail.trim()) return;
    setStep("file");
  }

  // Drag-and-drop handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0];
    if (picked) setFile(picked);
  }

  // Step 2 — upload
  async function handleUploadSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setError(null);

    const form = new FormData();
    form.append("token", token);
    form.append("vendor_name", vendorName);
    form.append("vendor_email", vendorEmail);
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setStep("success");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (step === "success") {
    return (
      <div className="rounded-2xl border border-white/10 bg-surface-strong p-8 text-center">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-accent/10">
          <CheckCircle className="size-7 text-accent" />
        </div>
        <p className="text-base font-semibold text-white">Invoice submitted</p>
        <p className="mt-2 text-sm text-muted">
          Your invoice has been received. You don&apos;t need to do anything else.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-strong p-6 sm:p-8">
      {/* Header */}
      <p className="mb-1 text-[0.7rem] font-mono uppercase tracking-widest text-muted">
        {label}
      </p>
      <h1 className="text-xl font-semibold text-white">Submit an invoice</h1>
      <p className="mt-1 text-sm text-muted">
        {step === "identity"
          ? "Enter your details so we can identify this invoice."
          : `Uploading as ${vendorName} · ${vendorEmail}`}
      </p>

      {/* Step indicator */}
      <div className="my-5 flex items-center gap-2">
        {(["identity", "file"] as Array<"identity" | "file">).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            {i > 0 && <div className="h-px w-6 bg-white/10" />}
            <div
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                step === s
                  ? "bg-accent text-slate-950"
                  : s === "identity" && step === "file"
                    ? "bg-white/10 text-muted line-through"
                    : "bg-white/5 text-muted",
              )}
            >
              {i + 1}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Step 1 — identity */}
      {step === "identity" && (
        <form onSubmit={handleIdentitySubmit} className="space-y-4">
          <Field label="Your name">
            <input
              type="text"
              required
              autoFocus
              placeholder="Jane Smith"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Your email">
            <input
              type="email"
              required
              placeholder="jane@company.com"
              value={vendorEmail}
              onChange={(e) => setVendorEmail(e.target.value)}
              className={inputClass}
            />
          </Field>
          <button type="submit" className={primaryBtn}>
            Continue
            <ArrowRight className="size-4" />
          </button>
        </form>
      )}

      {/* Step 2 — file */}
      {step === "file" && (
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {/* Drop zone */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
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
                  or click to browse · PDF, JPG, PNG, WEBP · max 10 MB
                </p>
              </>
            )}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleFileChange}
          />

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep("identity")}
              disabled={isSubmitting}
              className={secondaryBtn}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={!file || isSubmitting}
              className={cn(primaryBtn, "flex-1")}
            >
              {isSubmitting ? "Uploading…" : "Submit invoice"}
              {!isSubmitting && <Upload className="size-4" />}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-muted-strong">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-muted outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/20";

const primaryBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5 hover:border-accent/45 hover:bg-white/[0.1] disabled:pointer-events-none disabled:opacity-40";

const secondaryBtn =
  "inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted hover:text-white disabled:opacity-40";
