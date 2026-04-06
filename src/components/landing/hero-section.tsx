import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { ButtonLink } from "@/components/landing/link-button";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { SystemsVisual } from "@/components/landing/systems-visual";
import { AsciiArt } from "@/components/terminal/ascii-art";
import { asciiArt } from "@/content/ascii-art";

export function HeroSection() {
  return (
    <SectionShell id="hero" className="pb-16 pt-28 sm:pb-20 sm:pt-32 lg:pt-34">
      <SectionInner className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_0.98fr]">
        <div className="max-w-2xl">
          <Reveal>
            <AsciiArt
              art={asciiArt.logo}
              label="Axion Technologies logo"
              className="mb-6 text-[0.55rem] leading-[1.3] sm:text-xs"
            />
            <p className="text-xs uppercase tracking-[0.2em] md:hidden">
              <span className="text-accent">AXION</span>
              <span className="text-muted">{" // technologies"}</span>
            </p>
          </Reveal>

          {siteContent.hero.eyebrow ? (
            <Reveal>
              <p className="mt-4 text-[0.72rem] uppercase tracking-[0.34em]">
                <span aria-hidden="true" className="text-accent">
                  ${" "}
                </span>
                <span className="text-muted-strong">
                  {siteContent.hero.eyebrow}
                </span>
              </p>
            </Reveal>
          ) : null}

          <Reveal delay={0.05}>
            <h1 className="glow-text mt-6 max-w-[18ch] text-4xl font-bold leading-[1.05] text-white sm:text-5xl lg:text-6xl">
              {siteContent.hero.title}
              <span className="mt-2 block text-[0.9em] text-accent">
                {siteContent.hero.emphasis}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="mt-6 max-w-[34rem] text-sm leading-7 text-muted-strong sm:text-base sm:leading-8">
              {siteContent.hero.description}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 max-w-[40rem] text-[0.82rem] leading-7 text-white/40 sm:text-sm">
              <span aria-hidden="true" className="text-accent/60">
                {"// "}
              </span>
              {siteContent.hero.audienceLine}
            </p>
          </Reveal>

          <Reveal delay={0.16}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={siteConfig.bookingUrl} bookingSource="hero">
                {"[ "}{siteContent.hero.primaryCta}{" ]"}
              </ButtonLink>
              <ButtonLink href={siteContent.hero.secondaryHref} variant="secondary">
                {"[ "}{siteContent.hero.secondaryCta}{" ]"}
              </ButtonLink>
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              <span aria-hidden="true" className="text-accent/50">
                {">"}{" "}
              </span>
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
