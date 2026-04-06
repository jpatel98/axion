"use client";

import { Mail } from "lucide-react";
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
import { TerminalWindow } from "@/components/terminal/terminal-window";

const fieldClassName =
  "w-full border border-accent/15 bg-transparent px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/25 focus:border-accent/50 focus:bg-accent/[0.03] sm:px-4 sm:py-3 sm:text-sm";

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
    <TerminalWindow title="contact :: new_message">
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.2em]">
            <span aria-hidden="true" className="text-accent">
              ${" "}
            </span>
            <span className="text-muted-strong">compose</span>
            <span className="text-muted"> --async</span>
          </p>
          <h3 className="mt-3 text-lg font-bold text-white sm:text-xl">
            Not ready for a call? Drop us a note.
          </h3>
          <p className="mt-2 text-sm leading-7 text-muted">
            Tell us what&apos;s broken. We&apos;ll get back to you within a day.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-muted-strong">
            <span>
              <span aria-hidden="true" className="text-accent/50">
                {">"}{" "}
              </span>
              NAME:
            </span>
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
              <span id="name-error" className="text-xs normal-case text-rose-300">
                {errors.name}
              </span>
            ) : null}
          </label>

          <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-muted-strong">
            <span>
              <span aria-hidden="true" className="text-accent/50">
                {">"}{" "}
              </span>
              BUSINESS:
            </span>
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
              <span id="business-error" className="text-xs normal-case text-rose-300">
                {errors.business}
              </span>
            ) : null}
          </label>
        </div>

        <label className="mt-4 flex flex-col gap-1.5 text-xs uppercase tracking-wider text-muted-strong">
          <span>
            <span aria-hidden="true" className="text-accent/50">
              {">"}{" "}
            </span>
            EMAIL:
          </span>
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
            <span id="email-error" className="text-xs normal-case text-rose-300">
              {errors.email}
            </span>
          ) : null}
        </label>

        <label className="mt-4 flex flex-col gap-1.5 text-xs uppercase tracking-wider text-muted-strong">
          <span>
            <span aria-hidden="true" className="text-accent/50">
              {">"}{" "}
            </span>
            MESSAGE:
          </span>
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
            placeholder="Outdated site, too much manual admin, poor lead follow-up, disconnected tools, AI questions..."
            aria-invalid={Boolean(errors.helpNeeded)}
            aria-describedby={errors.helpNeeded ? "helpNeeded-error" : undefined}
          />
          {errors.helpNeeded ? (
            <span id="helpNeeded-error" className="text-xs normal-case text-rose-300">
              {errors.helpNeeded}
            </span>
          ) : null}
        </label>

        <div className="mt-6 flex flex-col gap-4 border-t border-accent/10 pt-6">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center border border-accent/30 bg-accent/10 px-5 py-3 text-sm font-bold uppercase tracking-wider text-accent hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(125,211,252,0.15)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "[ SENDING... ]" : "[ SEND ]"}
          </button>

          <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
            <a
              href={`mailto:${siteConfig.contactEmail}`}
              className="inline-flex items-center gap-2 border border-accent/10 px-3 py-2 text-xs hover:border-accent/30 hover:text-accent break-all"
            >
              <Mail className="size-3.5 shrink-0" />
              {siteConfig.contactEmail}
            </a>
          </div>
        </div>

        {message ? (
          <div
            className={cn(
              "mt-5 border p-4 text-sm",
              messageTone === "success" &&
                "border-green-400/30 bg-green-400/5 text-green-300",
              messageTone === "error" &&
                "border-rose-400/30 bg-rose-400/5 text-rose-300",
            )}
          >
            <p>
              <span className="font-bold">
                {messageTone === "success" ? "[OK] " : "[ERR] "}
              </span>
              {message}
            </p>
          </div>
        ) : null}
      </form>
    </TerminalWindow>
  );
}
