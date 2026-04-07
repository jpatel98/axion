import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { ButtonLink } from "@/components/landing/link-button";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function HeroSection() {
  return (
    <SectionShell id="hero" className="pb-16 pt-28 sm:pb-24 sm:pt-36 lg:pt-40">
      <SectionInner className="relative">
        <div className="max-w-4xl">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-strong sm:text-sm">
              {siteContent.hero.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 max-w-[18ch] font-display text-4xl italic leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
              {siteContent.hero.title}{" "}
              <span className="text-muted-strong">
                {siteContent.hero.emphasis}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-8 max-w-[42rem] text-base leading-7 text-muted-strong sm:text-lg sm:leading-8">
              {siteContent.hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-4 max-w-[42rem] text-sm leading-7 text-muted sm:text-base">
              {siteContent.hero.audienceLine}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-10 flex flex-wrap gap-4">
              <ButtonLink href={siteConfig.bookingUrl} bookingSource="hero">
                {siteContent.hero.primaryCta}
              </ButtonLink>
              <ButtonLink href={siteContent.hero.secondaryHref} variant="secondary">
                {siteContent.hero.secondaryCta}
              </ButtonLink>
            </div>
            <p className="mt-4 font-mono text-xs text-muted sm:text-sm">
              {siteContent.hero.primaryNote}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.16}>
          <div className="mt-14 flex flex-wrap items-center gap-6 border-t border-border-subtle pt-8 sm:gap-10">
            {siteContent.hero.stats.map((stat, i) => (
              <div key={stat} className="flex items-center gap-6 sm:gap-10">
                {i > 0 && (
                  <span className="hidden h-10 w-px bg-border-subtle sm:block" aria-hidden="true" />
                )}
                <div>
                  <p className="font-display text-2xl italic text-foreground sm:text-3xl">{stat.split(" ")[0]}</p>
                  <p className="mt-1 text-xs text-muted sm:text-sm">{stat.split(" ").slice(1).join(" ")}</p>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
