import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

const spanClasses = [
  "lg:col-span-6",
  "lg:col-span-6",
  "lg:col-span-4",
  "lg:col-span-4",
  "lg:col-span-4",
];

export function SolutionsSection() {
  return (
    <SectionShell id="solutions">
      <SectionInner>
        <SectionHeading
          eyebrow="Featured solutions"
          title={siteContent.solutions.title}
          description={siteContent.solutions.description}
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          {siteContent.solutions.items.map((item, index) => (
            <Reveal
              key={item.title}
              delay={index * 0.05}
              className={spanClasses[index] ?? "lg:col-span-4"}
            >
              <article className="surface-panel flex h-full flex-col rounded-[2rem] border border-white/10 p-6">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                  {item.industry}
                </p>
                <h3 className="mt-4 text-2xl font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-strong">
                  {item.description}
                </p>
                <div className="mt-6 border-t border-white/8 pt-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    What this solves
                  </p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-white">
                    {item.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
