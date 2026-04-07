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

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
          <Reveal delay={0.04}>
            <div className="h-full rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
              <div className="divide-y divide-border-subtle">
                {siteContent.proof.sharedOutcomes.map((item) => (
                  <article key={item.title} className="py-5 first:pt-0 last:pb-0">
                    <h3 className="text-base font-bold text-white sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-strong">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
              <div className="divide-y divide-border-subtle">
                {siteContent.proof.scenarios.map((item) => (
                  <article
                    key={item.industry}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                      {item.industry}
                    </p>

                    <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                      <div>
                        <h3 className="text-sm font-bold text-white sm:text-base">
                          {item.problem}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-muted-strong">
                          {item.fix}
                        </p>
                      </div>

                      <ul className="space-y-2 text-sm leading-7 text-foreground">
                        {item.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
