import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function PricingSection() {
  return (
    <SectionShell id="pricing">
      <SectionInner>
        <SectionHeading
          eyebrow="Pricing"
          title={siteContent.pricing.title}
          description={siteContent.pricing.description}
          align="center"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {siteContent.pricing.tiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.06}>
              <article className="flex h-full flex-col border border-accent/15 bg-[#030508] p-5 sm:p-6">
                <p className="text-xs uppercase tracking-wider text-accent/70">
                  {tier.label}
                </p>
                <h3 className="mt-3 text-xl font-bold text-white sm:text-2xl">
                  {tier.name}
                </h3>
                <p className="mt-2 text-lg font-bold text-accent">
                  {tier.price}
                </p>
                <p className="mt-3 text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                  {tier.description}
                </p>
                <ul className="mt-5 flex-1 space-y-2 border-t border-accent/8 pt-5">
                  {tier.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-6 text-white/90 sm:text-sm sm:leading-7"
                    >
                      <span className="text-green-400">*</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-sm text-muted-strong">
            {siteContent.pricing.footnote}
          </p>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
