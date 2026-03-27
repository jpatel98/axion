import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function WhyAxionSection() {
  return (
    <SectionShell id="why-axion">
      <SectionInner>
        <Reveal>
          <div className="light-panel rounded-[2.5rem] border border-white/10 px-6 py-8 text-surface-light-foreground shadow-[0_40px_100px_rgba(1,6,16,0.4)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
            <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
              <div>
                <SectionHeading
                  eyebrow="Why Axion"
                  title={siteContent.whyAxion.title}
                  description={siteContent.whyAxion.description}
                  theme="light"
                />

                <div className="mt-8 rounded-[2rem] bg-slate-950 px-6 py-6 text-white">
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-accent">
                    What Axion does instead
                  </p>
                  <div className="mt-6 space-y-5">
                    {siteContent.whyAxion.principles.map((item) => (
                      <div key={item.title}>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-slate-300">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {siteContent.whyAxion.comparisons.map((item, index) => (
                  <Reveal key={item.label} delay={index * 0.05}>
                    <article className="rounded-[1.7rem] border border-slate-200 bg-white/75 px-5 py-5 shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
                      <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-slate-500">
                        {item.label}
                      </p>
                      <h3 className="mt-3 text-xl font-semibold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </article>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
