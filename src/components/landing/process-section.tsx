import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { TerminalWindow } from "@/components/terminal/terminal-window";

export function ProcessSection() {
  return (
    <SectionShell id="process">
      <SectionInner>
        <SectionHeading
          eyebrow="Process"
          title={siteContent.process.title}
          description={siteContent.process.description}
          align="center"
        />

        <Reveal delay={0.04}>
          <TerminalWindow title="axion :: workflow" className="mt-12">
            <div className="space-y-6">
              {siteContent.process.steps.map((step, index) => (
                <div key={step.title}>
                  <p className="text-sm text-muted-strong">
                    <span className="text-accent">$</span>{" "}
                    axion {step.title.toLowerCase()}
                  </p>
                  <div className="mt-2 border-l-2 border-accent/15 pl-4">
                    <p className="text-sm leading-7 text-muted">
                      <span className="text-accent/60">&gt;</span>{" "}
                      {step.description}
                    </p>
                    <p className="mt-1 text-sm leading-7 text-white/90">
                      <span className="text-green-400">{`=> `}</span>
                      {step.outcome}
                    </p>
                  </div>
                  {index < siteContent.process.steps.length - 1 && (
                    <p
                      aria-hidden="true"
                      className="mt-4 text-xs text-accent/15"
                    >
                      ─────────────────────────
                    </p>
                  )}
                </div>
              ))}
              <p className="mt-2 text-sm text-green-400">
                Process complete. <span className="cursor-blink" />
              </p>
            </div>
          </TerminalWindow>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
