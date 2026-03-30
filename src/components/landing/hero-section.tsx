import { ArrowUpRight } from "lucide-react";
import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { ButtonLink } from "@/components/landing/link-button";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { SystemsVisual } from "@/components/landing/systems-visual";

export function HeroSection() {
  return (
    <SectionShell id="hero" className="pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pt-34">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_12%_15%,rgba(67,110,201,0.16),transparent_28%)]" />
      <SectionInner className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          {siteContent.hero.eyebrow ? (
            <Reveal>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-accent">
                {siteContent.hero.eyebrow}
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={0.05}>
            <h1 className="max-w-[12ch] text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-[4.75rem]">
              {siteContent.hero.title}
              <span className="mt-3 block font-display text-[0.9em] font-normal italic text-accent">
                {siteContent.hero.emphasis}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[34rem] text-base leading-8 text-muted-strong sm:text-lg">
              {siteContent.hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 max-w-[40rem] text-sm leading-7 text-white/72 sm:text-[0.95rem]">
              {siteContent.hero.audienceLine}
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={siteConfig.bookingUrl} bookingSource="hero">
                {siteContent.hero.primaryCta}
                <ArrowUpRight className="size-4" />
              </ButtonLink>
              <ButtonLink href={siteContent.hero.secondaryHref} variant="secondary">
                {siteContent.hero.secondaryCta}
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              {siteContent.hero.primaryNote}
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.14} className="lg:justify-self-end">
          <SystemsVisual />
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
