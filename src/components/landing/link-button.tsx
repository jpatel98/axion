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
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium sm:text-base",
        variant === "primary" &&
          "bg-foreground text-background hover:opacity-90",
        variant === "secondary" &&
          "border border-border-strong text-foreground hover:bg-accent-soft",
        className,
      )}
    >
      {children}
    </a>
  );
}
