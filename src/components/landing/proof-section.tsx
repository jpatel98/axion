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
            <div className="border border-accent/15 bg-[#030508] p-4 sm:p-6">
              <div className="divide-y divide-accent/10">
                {siteContent.proof.sharedOutcomes.map((item) => (
                  <article key={item.title} className="py-5 first:pt-0 last:pb-0">
                    <h3 className="text-base font-bold text-white sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                      {item.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="border border-accent/15 bg-[#030508] p-4 sm:p-6">
              <div className="divide-y divide-accent/10">
                {siteContent.proof.scenarios.map((item) => (
                  <article
                    key={item.industry}
                    className="py-5 first:pt-0 last:pb-0"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-accent">
                      {item.industry}
                    </p>

                    <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                      <div>
                        <h3 className="text-sm font-bold text-white sm:text-base">
                          {item.problem}
                        </h3>
                        <p className="mt-2 text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                          <span className="text-accent/50">{"=> "}</span>
                          {item.fix}
                        </p>
                      </div>

                      <ul className="space-y-2 text-xs leading-6 text-white/90 sm:text-sm sm:leading-7">
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
            </div>
          </Reveal>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
