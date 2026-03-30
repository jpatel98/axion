import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function ProofSection() {
  return (
    <SectionShell id="results">
      <SectionInner>
        <SectionHeading
          eyebrow="Proof"
          title={siteContent.proof.title}
          description={siteContent.proof.description}
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[0.4fr_0.6fr]">
          <Reveal delay={0.04}>
            <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.34)]">
              <div className="divide-y divide-white/10">
                {siteContent.proof.sharedOutcomes.map((item) => (
                  <article key={item.title} className="px-6 py-6 sm:px-7">
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                      What improves
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-strong">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.34)]">
              <div className="divide-y divide-white/10">
                {siteContent.proof.scenarios.map((item) => (
                  <article
                    key={item.industry}
                    className="grid gap-5 px-6 py-6 sm:px-7 lg:grid-cols-[9rem_1fr]"
                  >
                    <div>
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                        {item.industry}
                      </p>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                      <div>
                        <h3 className="text-xl font-semibold text-white">
                          {item.problem}
                        </h3>
                        <p className="mt-3 text-sm leading-7 text-muted-strong">
                          {item.fix}
                        </p>
                      </div>

                      <ul className="space-y-3 text-sm leading-7 text-white/90">
                        {item.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-3">
                            <span className="mt-[0.72rem] size-1.5 rounded-full bg-accent" />
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
