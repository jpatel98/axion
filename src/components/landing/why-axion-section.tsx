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

          <div className="mt-8 space-y-5">
            {siteContent.whyAxion.principles.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.04}>
                <article className="border-b border-accent/10 pb-5 last:border-b-0 last:pb-0">
                  <p className="text-xs text-accent">
                    [{String(index + 1).padStart(2, "0")}]
                  </p>
                  <h3 className="mt-2 text-base font-bold text-white sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 max-w-xl text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.06}>
          <div className="border border-accent/15 bg-[#030508] p-4 sm:p-6">
            <div className="divide-y divide-accent/10">
              {siteContent.whyAxion.comparisons.map((item) => (
                <article
                  key={item.label}
                  className="py-4 first:pt-0 last:pb-0"
                >
                  <p className="text-xs font-medium uppercase tracking-wider text-accent/70">
                    {item.label}
                  </p>
                  <h3 className="mt-2 text-sm font-bold text-white sm:text-base">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                    {item.description}
                  </p>
                </article>
              ))}
              <div className="pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-green-400">
                  Axion
                </p>
                <p className="mt-1 text-xs text-green-300 sm:text-sm">
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
