import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function EarlyAccessSection() {
  return (
    <SectionShell id="early-access" className="bg-accent/[0.03]">
      <SectionInner>
        <SectionHeading
          eyebrow="Early Access"
          title={siteContent.earlyAccess.title}
          description={siteContent.earlyAccess.description}
          align="center"
        />

        <Reveal delay={0.06}>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
                What it handles
              </h3>
              <ul className="mt-5 space-y-3">
                {siteContent.earlyAccess.handles.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-7 text-muted-strong"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
              <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
                What that means
              </h3>
              <ul className="mt-5 space-y-3">
                {siteContent.earlyAccess.means.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-7 text-muted-strong"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 text-center">
            <a
              href={siteContent.earlyAccess.ctaHref}
              className="inline-flex items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-accent-strong hover:shadow-lg sm:text-base"
            >
              {siteContent.earlyAccess.ctaLabel}
            </a>
            <p className="mt-4 text-sm text-muted">
              {siteContent.earlyAccess.footnote}
            </p>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
