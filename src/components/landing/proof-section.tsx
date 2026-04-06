import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { TerminalWindow } from "@/components/terminal/terminal-window";

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
            <TerminalWindow title="outcomes">
              <div className="divide-y divide-accent/10">
                {siteContent.proof.sharedOutcomes.map((item) => (
                  <article key={item.title} className="py-5 first:pt-0 last:pb-0">
                    <p className="text-xs uppercase tracking-wider text-accent">
                      what_improves
                    </p>
                    <h3 className="mt-2 text-lg font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-muted-strong">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </TerminalWindow>
          </Reveal>

          <Reveal delay={0.08}>
            <TerminalWindow title="case_files">
              <div className="divide-y divide-accent/10">
                {siteContent.proof.scenarios.map((item) => (
                  <article
                    key={item.industry}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <p className="text-xs text-accent">
                      [{item.industry.toUpperCase().replace(/\s+/g, "_")}]
                    </p>

                    <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                      <div>
                        <h3 className="text-base font-bold text-white">
                          {item.problem}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-muted-strong">
                          <span className="text-accent/50">{`=> `}</span>
                          {item.fix}
                        </p>
                      </div>

                      <ul className="space-y-2 text-sm leading-7 text-white/90">
                        {item.outcomes.map((outcome) => (
                          <li key={outcome} className="flex items-start gap-2">
                            <span className="text-green-400">*</span>
                            <span>{outcome}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </TerminalWindow>
          </Reveal>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
