import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function CredibilityStrip() {
  return (
    <SectionShell className="py-8 sm:py-10">
      <SectionInner>
        <Reveal>
          <div className="surface-panel rounded-[2rem] border border-white/10 px-5 py-5 sm:px-7">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {siteContent.credibility.map((item) => (
                <li
                  key={item}
                  className="rounded-full border border-white/10 px-4 py-3 text-center text-sm text-muted-strong"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
