import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function WhyAxionSection() {
  return (
    <SectionShell id="why-axion">
      <SectionInner className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <SectionHeading
            eyebrow="Why Axion"
            title={siteContent.whyAxion.title}
            description={siteContent.whyAxion.description}
          />

          <div className="mt-8 space-y-6">
            {siteContent.whyAxion.principles.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.04}>
                <article className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                    0{index + 1}
                  </p>
                  <h3 className="mt-3 text-2xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-muted-strong">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.06}>
          <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.34)]">
            <div className="border-b border-white/10 px-6 py-6 sm:px-7">
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                Compared with the usual options
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-muted-strong">
                Axion is built for businesses that need practical change, not
                more noise around the problem.
              </p>
            </div>

            <div className="divide-y divide-white/10">
              {siteContent.whyAxion.comparisons.map((item) => (
                <article
                  key={item.label}
                  className="grid gap-3 px-6 py-6 sm:px-7 md:grid-cols-[10rem_1fr] md:gap-6"
                >
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-white/50">
                    {item.label}
                  </p>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-muted-strong">
                      {item.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
