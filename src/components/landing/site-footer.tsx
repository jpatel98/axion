import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { SectionInner } from "@/components/landing/section-shell";

export function SiteFooter() {
  return (
    <footer className="border-t border-accent/15 py-10">
      <SectionInner className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-bold text-accent">
            AXION
          </p>
          <p className="mt-3 max-w-md text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
            {siteContent.footer.tagline}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              Contact
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted-strong">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="block break-all hover:text-accent"
              >
                {siteConfig.contactEmail}
              </a>
              <a
                href={siteConfig.siteUrl}
                className="block hover:text-accent"
              >
                {siteContent.footer.domain}
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              Navigate
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted-strong">
              {siteContent.nav.map((item) => (
                <a key={item.label} href={item.href} className="block hover:text-accent">
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </SectionInner>

      <SectionInner className="mt-8 flex flex-col gap-2 border-t border-accent/8 pt-6 text-[0.65rem] text-muted sm:flex-row sm:items-center sm:justify-between sm:text-xs">
        <p className="break-words">{siteContent.footer.copyright}</p>
        <p>{siteContent.footer.legal}</p>
      </SectionInner>
    </footer>
  );
}
