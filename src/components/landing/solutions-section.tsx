import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function SolutionsSection() {
  return (
    <SectionShell id="solutions">
      <SectionInner>
        <SectionHeading
          eyebrow="Use cases"
          title={siteContent.solutions.title}
          description={siteContent.solutions.description}
        />

        <Reveal delay={0.04}>
          <div className="mt-12 overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.34)]">
            <div className="grid gap-px bg-white/10 lg:grid-cols-3">
              {siteContent.solutions.items.map((item) => (
                <article
                  key={item.title}
                  className="flex h-full flex-col bg-[rgba(8,13,24,0.94)] p-6 sm:p-7"
                >
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                    {item.industry}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-muted-strong">
                    {item.description}
                  </p>
                  <ul className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm leading-7 text-white/90">
                    {item.outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-3">
                        <span className="mt-[0.7rem] size-1.5 rounded-full bg-accent" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
