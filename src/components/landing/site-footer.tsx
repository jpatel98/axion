import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { SectionInner } from "@/components/landing/section-shell";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 py-10">
      <SectionInner className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.34em] text-accent">
            {siteContent.footer.name}
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-strong">
            {siteContent.footer.tagline}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Contact
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted-strong">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="block hover:text-white"
              >
                {siteConfig.contactEmail}
              </a>
              <a
                href={siteConfig.siteUrl}
                className="block hover:text-white"
              >
                {siteContent.footer.domain}
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-white/45">
              Links
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted-strong">
              {siteContent.nav.map((item) => (
                <a key={item.label} href={item.href} className="block hover:text-white">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </SectionInner>

      <SectionInner className="mt-8 flex flex-col gap-2 border-t border-white/8 pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{siteContent.footer.copyright}</p>
        <p>{siteContent.footer.legal}</p>
      </SectionInner>
    </footer>
  );
}
