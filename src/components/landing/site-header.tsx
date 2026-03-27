"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 16);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            "rounded-full border px-4 py-3 transition-all sm:px-5",
            hasScrolled
              ? "border-white/12 bg-surface/90 shadow-[0_18px_56px_rgba(1,6,16,0.46)] backdrop-blur-xl"
              : "border-white/10 bg-surface/60 backdrop-blur-md",
          )}
        >
          <div className="flex items-center justify-between gap-4">
            <a href="#top" className="flex min-w-0 flex-col">
              <span className="truncate text-base font-semibold text-white">
                Axion Technologies
              </span>
              <span className="font-mono text-[0.64rem] uppercase tracking-[0.3em] text-accent">
                Small business systems
              </span>
            </a>

            <nav className="hidden items-center gap-6 md:flex">
              {siteContent.nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-sm text-muted-strong hover:text-white"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="hidden md:block">
              <a
                href={siteConfig.bookingUrl}
                className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:-translate-y-0.5 hover:border-accent/45 hover:bg-white/[0.08]"
              >
                <span className="px-2">{siteContent.headerCta}</span>
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-white text-slate-950">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </a>
            </div>

            <button
              type="button"
              className="inline-flex size-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white md:hidden"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {isMenuOpen ? (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="mt-4 overflow-hidden rounded-[1.6rem] border border-white/10 bg-surface/95 p-4 backdrop-blur-xl md:hidden"
              >
                <nav className="flex flex-col gap-2">
                  {siteContent.nav.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="rounded-2xl px-3 py-3 text-sm text-muted-strong hover:bg-white/[0.04] hover:text-white"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>

                <a
                  href={siteConfig.bookingUrl}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {siteContent.headerCta}
                  <span className="inline-flex size-7 items-center justify-center rounded-full bg-white text-slate-950">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </a>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
