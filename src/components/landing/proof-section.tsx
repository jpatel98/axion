import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function ProofSection() {
  return (
    <SectionShell id="results">
      <SectionInner>
        <SectionHeading
          eyebrow="Results"
          title={siteContent.proof.title}
          description={siteContent.proof.description}
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {siteContent.proof.sharedOutcomes.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.04}>
              <article className="h-full rounded-xl border border-border-subtle bg-surface p-6 sm:p-8">
                <p className="font-mono text-xs text-muted">{String(index + 1).padStart(2, "0")}</p>
                <h3 className="mt-3 font-display text-xl italic text-foreground sm:text-2xl">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-strong">
                  {item.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {siteContent.proof.scenarios.map((item, index) => (
            <Reveal key={item.industry} delay={0.12 + index * 0.04}>
              <article className="h-full rounded-xl border border-border-subtle bg-surface-dark p-6 text-surface-dark-foreground sm:p-8">
                <p className="font-mono text-xs uppercase tracking-wider opacity-60">
                  {item.industry}
                </p>
                <h3 className="mt-3 text-base font-semibold sm:text-lg">
                  {item.problem}
                </h3>
                <p className="mt-3 text-sm leading-7 opacity-70">
                  {item.fix}
                </p>
                <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                  {item.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2 text-sm leading-6">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-current opacity-40" />
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
