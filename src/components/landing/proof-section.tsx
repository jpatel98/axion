import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function ProofSection() {
  return (
    <SectionShell id="outcomes">
      <SectionInner>
        <SectionHeading
          eyebrow="Outcomes"
          title={siteContent.proof.title}
          description={siteContent.proof.description}
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {siteContent.proof.sharedOutcomes.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <article className="h-full rounded-2xl border border-border-subtle bg-surface-strong p-6">
                <p className="text-sm font-semibold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-strong">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {siteContent.proof.scenarios.map((item, index) => (
            <Reveal key={item.industry} delay={index * 0.06}>
              <article className="flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                  {item.industry}
                </p>
                <h3 className="mt-3 text-base font-bold text-white sm:text-lg">
                  {item.problem}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-strong">
                  {item.fix}
                </p>
                <ul className="mt-5 space-y-2 border-t border-border-subtle pt-5">
                  {item.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2 text-sm leading-6 text-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
