"use client";

import { CheckCircle2, Mail } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import {
  submitLead,
  initialLeadFormValues,
  validateLeadForm,
  type LeadFormErrors,
  type LeadFormValues,
} from "@/lib/lead";
import {
  trackFormStart,
  trackFormSubmitError,
  trackFormSubmitSuccess,
} from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

const fieldClassName =
  "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/40 focus:border-accent/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-accent/20";

export function ContactForm() {
  const [values, setValues] = useState<LeadFormValues>(initialLeadFormValues);
  const [errors, setErrors] = useState<LeadFormErrors>({});
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");
  const [isPending, startTransition] = useTransition();
  const hasTrackedStart = useRef(false);

  function handleFieldFocus() {
    if (hasTrackedStart.current) {
      return;
    }

    hasTrackedStart.current = true;
    trackFormStart();
  }

  function updateField<Key extends keyof LeadFormValues>(
    field: Key,
    value: LeadFormValues[Key],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateLeadForm(values);
    setErrors(nextErrors);
    setMessage(null);

    if (Object.keys(nextErrors).length > 0) {
      setMessageTone("error");
      trackFormSubmitError("client_validation");
      return;
    }

    startTransition(async () => {
      const result = await submitLead(values);

      if (result.status === "error") {
        setMessageTone("error");
        setMessage(result.message);
        setErrors(result.fieldErrors ?? {});
        trackFormSubmitError(result.fieldErrors ? "server_validation" : "submit");
        return;
      }

      setMessageTone("success");
      setMessage(result.message);
      setValues(initialLeadFormValues);
      setErrors({});
      hasTrackedStart.current = false;
      trackFormSubmitSuccess();
    });
  }

  return (
    <form
      className="rounded-[2rem] border border-white/10 bg-[rgba(8,13,24,0.76)] p-6 sm:p-7"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="mb-6">
        <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-accent">
          Async option
        </p>
        <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
          Not ready for a call? Drop us a note.
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-7 text-muted">
          Tell us what&apos;s broken. We&apos;ll get back to you within a day.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-white">
          <span>Name</span>
          <input
            type="text"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={(event) => updateField("name", event.target.value)}
            onFocus={handleFieldFocus}
            className={cn(
              fieldClassName,
              errors.name && "border-rose-400/70 focus:border-rose-300",
            )}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name ? (
            <span id="name-error" className="text-xs text-rose-300">
              {errors.name}
            </span>
          ) : null}
        </label>

        <label className="flex flex-col gap-2 text-sm text-white">
          <span>Business</span>
          <input
            type="text"
            name="business"
            autoComplete="organization"
            value={values.business}
            onChange={(event) => updateField("business", event.target.value)}
            onFocus={handleFieldFocus}
            className={cn(
              fieldClassName,
              errors.business && "border-rose-400/70 focus:border-rose-300",
            )}
            placeholder="Company or practice name"
            aria-invalid={Boolean(errors.business)}
            aria-describedby={errors.business ? "business-error" : undefined}
          />
          {errors.business ? (
            <span id="business-error" className="text-xs text-rose-300">
              {errors.business}
            </span>
          ) : null}
        </label>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm text-white">
        <span>Email</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => updateField("email", event.target.value)}
          onFocus={handleFieldFocus}
          className={cn(
            fieldClassName,
            errors.email && "border-rose-400/70 focus:border-rose-300",
          )}
          placeholder={siteConfig.contactEmail}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email ? (
          <span id="email-error" className="text-xs text-rose-300">
            {errors.email}
          </span>
        ) : null}
      </label>

      <label className="mt-4 flex flex-col gap-2 text-sm text-white">
        <span>What do you need help with?</span>
        <textarea
          name="helpNeeded"
          rows={5}
          value={values.helpNeeded}
          onChange={(event) => updateField("helpNeeded", event.target.value)}
          onFocus={handleFieldFocus}
          className={cn(
            fieldClassName,
            "resize-none",
            errors.helpNeeded && "border-rose-400/70 focus:border-rose-300",
          )}
          placeholder="Outdated site, too much manual admin, poor lead follow-up, disconnected tools, AI questions, or a mix of everything."
          aria-invalid={Boolean(errors.helpNeeded)}
          aria-describedby={errors.helpNeeded ? "helpNeeded-error" : undefined}
        />
        {errors.helpNeeded ? (
          <span id="helpNeeded-error" className="text-xs text-rose-300">
            {errors.helpNeeded}
          </span>
        ) : null}
      </label>

      <div className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-6">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-5 py-3.5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:border-accent/50 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Sending..." : "Send the details"}
        </button>

        <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
          <a
            href={`mailto:${siteConfig.contactEmail}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 hover:border-accent/50 hover:text-white"
          >
            <Mail className="size-4" />
            {siteConfig.contactEmail}
          </a>
        </div>
      </div>

      {message ? (
        <div
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm",
            messageTone === "success" &&
              "border-emerald-400/20 bg-emerald-400/10 text-emerald-100",
            messageTone === "error" &&
              "border-rose-400/20 bg-rose-400/10 text-rose-100",
          )}
        >
          <div className="flex items-start gap-3">
            <CheckCircle2
              className={cn(
                "mt-0.5 size-5 shrink-0",
                messageTone === "success" ? "text-emerald-300" : "text-rose-300",
              )}
            />
            <p>{message}</p>
          </div>
        </div>
      ) : null}
    </form>
  );
}
