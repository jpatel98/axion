"use client";

import { trackBookingClick, trackEvent, type BookingSource } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
  bookingSource?: BookingSource;
  trackingEvent?: string;
  trackingParams?: Record<string, string>;
};

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  bookingSource,
  trackingEvent,
  trackingParams,
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      onClick={() => {
        if (bookingSource) {
          trackBookingClick(bookingSource);
          return;
        }

        if (trackingEvent) {
          trackEvent(trackingEvent, trackingParams);
        }
      }}
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold uppercase tracking-wider sm:px-5 sm:py-3 sm:text-sm",
        variant === "primary" &&
          "border border-accent/40 bg-accent/10 text-accent hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(125,211,252,0.15)]",
        variant === "secondary" &&
          "border border-accent/15 bg-accent/[0.03] text-muted-strong hover:border-accent/30 hover:text-accent",
        className,
      )}
    >
      {children}
    </a>
  );
}
