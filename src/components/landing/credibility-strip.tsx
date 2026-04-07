import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function CredibilityStrip() {
  return (
    <SectionShell className="py-6 sm:py-8">
      <SectionInner>
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-3 py-3">
            {siteContent.credibility.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border-subtle bg-surface-light/50 px-4 py-1.5 text-xs font-medium text-muted-strong sm:text-sm"
              >
                {item.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
