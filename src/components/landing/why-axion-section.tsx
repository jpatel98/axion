import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function WhyAxionSection() {
  return (
    <SectionShell id="why-axion">
      <SectionInner className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <SectionHeading
            eyebrow="Why Axion"
            title={siteContent.whyAxion.title}
            description={siteContent.whyAxion.description}
          />

          <div className="mt-8 space-y-6">
            {siteContent.whyAxion.principles.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.04}>
                <article className="border-b border-border-subtle pb-6 last:border-b-0 last:pb-0">
                  <p className="text-sm font-semibold text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-strong">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.06}>
          <div className="rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
            <div className="divide-y divide-border-subtle">
              {siteContent.whyAxion.comparisons.map((item) => (
                <article
                  key={item.label}
                  className="py-5 first:pt-0 last:pb-0"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-base font-bold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-7 text-muted-strong">
                    {item.description}
                  </p>
                </article>
              ))}
              <div className="pt-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  Axion
                </p>
                <p className="mt-1 text-sm font-medium text-emerald-300">
                  Practical change. Working software. Fewer problems.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
