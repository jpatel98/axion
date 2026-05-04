import { Fragment } from "react";
import { siteContent } from "@/content/site";
import { ButtonLink } from "@/components/landing/link-button";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { SystemsVisual } from "@/components/landing/systems-visual";

export function HeroSection() {
  return (
    <SectionShell id="hero" className="pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pt-36">
      <SectionInner className="relative grid items-center gap-12 lg:grid-cols-[0.95fr_0.78fr]">
        <div className="max-w-3xl">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-[0.15em] text-accent">
              {siteContent.hero.eyebrow}
            </p>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="mt-6 max-w-[20ch] text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              {siteContent.hero.title}{" "}
              <span className="font-display font-normal italic text-accent">
                {siteContent.hero.emphasis}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[38rem] text-base leading-7 text-muted-strong sm:text-lg sm:leading-8">
              {siteContent.hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-4 max-w-[40rem] text-sm leading-7 text-muted sm:text-base">
              {siteContent.hero.audienceLine}
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-10 flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface-light/50 px-6 py-5 sm:flex-row sm:items-center sm:gap-6">
              {siteContent.hero.stats.map((stat, i) => (
                <Fragment key={stat}>
                  {i > 0 && (
                    <span className="hidden h-8 w-px shrink-0 bg-border-subtle sm:block" aria-hidden="true" />
                  )}
                  <span className="text-sm font-semibold text-white sm:text-base">{stat}</span>
                </Fragment>
              ))}
            </div>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap gap-4">
              <ButtonLink
                href="#assessment"
                trackingEvent="hero_assessment_cta_click"
              >
                {siteContent.hero.primaryCta}
              </ButtonLink>
              <ButtonLink href={siteContent.hero.secondaryHref} variant="secondary">
                {siteContent.hero.secondaryCta}
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm text-muted">
              {siteContent.hero.primaryNote}
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.18}>
          <div className="hidden lg:block">
            <SystemsVisual />
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
