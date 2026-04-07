import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function EarlyAccessSection() {
  return (
    <SectionShell id="early-access" className="bg-surface-dark text-surface-dark-foreground">
      <SectionInner>
        <SectionHeading
          eyebrow="Early Access"
          title={siteContent.earlyAccess.title}
          description={siteContent.earlyAccess.description}
          align="center"
        />

        <Reveal delay={0.06}>
          <div className="mx-auto mt-12 grid max-w-4xl gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 p-6 sm:p-8">
              <h3 className="font-mono text-xs uppercase tracking-wider opacity-60">
                What it handles
              </h3>
              <ul className="mt-5 space-y-3">
                {siteContent.earlyAccess.handles.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-7 opacity-80"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-white/10 p-6 sm:p-8">
              <h3 className="font-mono text-xs uppercase tracking-wider opacity-60">
                What that means
              </h3>
              <ul className="mt-5 space-y-3">
                {siteContent.earlyAccess.means.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm leading-7 opacity-80"
                  >
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-50" />
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
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-medium hover:bg-white/20 sm:text-base"
            >
              {siteContent.earlyAccess.ctaLabel}
            </a>
            <p className="mt-4 text-sm opacity-50">
              {siteContent.earlyAccess.footnote}
            </p>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
