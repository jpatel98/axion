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
              <article className="flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wider text-accent">
                  {tier.label}
                </p>
                <h3 className="mt-3 text-2xl font-bold text-white">
                  {tier.name}
                </h3>
                <p className="mt-2 text-xl font-bold text-accent">
                  {tier.price}
                </p>
                <p className="mt-3 text-sm leading-7 text-muted-strong">
                  {tier.description}
                </p>
                <ul className="mt-6 flex-1 space-y-3 border-t border-border-subtle pt-6">
                  {tier.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-sm leading-7 text-foreground"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
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
