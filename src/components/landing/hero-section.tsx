import { ArrowUpRight } from "lucide-react";
import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { ButtonLink } from "@/components/landing/link-button";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { SystemsVisual } from "@/components/landing/systems-visual";

export function HeroSection() {
  return (
    <SectionShell className="pb-18 pt-28 sm:pb-22 sm:pt-32 lg:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_12%_15%,rgba(67,110,201,0.16),transparent_28%)]" />
      <SectionInner className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="max-w-2xl">
          <Reveal>
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-accent">
              {siteContent.hero.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-5 text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              {siteContent.hero.title}
              <span className="mt-3 block font-display text-[0.92em] font-normal italic text-accent">
                {siteContent.hero.emphasis}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base leading-8 text-muted-strong sm:text-lg">
              {siteContent.hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={siteConfig.bookingUrl}>
                {siteContent.hero.primaryCta}
                <ArrowUpRight className="size-4" />
              </ButtonLink>
              <ButtonLink href={siteContent.hero.secondaryHref} variant="secondary">
                {siteContent.hero.secondaryCta}
              </ButtonLink>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {siteContent.hero.highlights.map((item) => (
                <div
                  key={item.title}
                  className="surface-panel rounded-[1.5rem] border border-white/10 px-4 py-4"
                >
                  <p className="font-mono text-[0.7rem] uppercase tracking-[0.28em] text-accent">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-muted-strong">
                    {item.copy}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.12} className="lg:justify-self-end">
          <SystemsVisual />
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
