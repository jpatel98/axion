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

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {siteContent.pricing.tiers.map((tier, index) => (
            <Reveal key={tier.name} delay={index * 0.06}>
              <article className="flex h-full flex-col rounded-xl border border-border-subtle bg-surface p-6 sm:p-8">
                <p className="font-mono text-xs uppercase tracking-wider text-muted">
                  {tier.label}
                </p>
                <h3 className="mt-3 font-display text-2xl italic text-foreground sm:text-3xl">
                  {tier.name}
                </h3>
                <p className="mt-2 text-xl font-semibold text-foreground">
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
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground opacity-30" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-sm text-muted">
            {siteContent.pricing.footnote}
          </p>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
