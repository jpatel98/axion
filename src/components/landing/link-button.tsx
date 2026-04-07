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
        "inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold sm:text-base",
        variant === "primary" &&
          "bg-accent text-white shadow-md hover:bg-accent-strong hover:shadow-lg",
        variant === "secondary" &&
          "border border-border-strong bg-transparent text-muted-strong hover:border-accent hover:text-white",
        className,
      )}
    >
      {children}
    </a>
  );
}
