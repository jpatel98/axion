"use client";

import { siteConfig } from "@/lib/site-config";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

const bookingEventMap = {
  header: "header_cta_click",
  hero: "hero_cta_click",
  final: "final_cta_click",
  mobile_sticky: "mobile_sticky_cta_click",
} as const;

export type BookingSource = keyof typeof bookingEventMap;

function hasAnalytics() {
  return (
    typeof window !== "undefined" &&
    Boolean(siteConfig.gaMeasurementId) &&
    typeof window.gtag === "function"
  );
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (!hasAnalytics()) {
    return;
  }

  window.gtag?.("event", eventName, params);
}

export function trackBookingClick(source: BookingSource) {
  trackEvent(bookingEventMap[source], {
    source,
    destination: siteConfig.bookingUrl,
    cta_label: "Book Assessment Call",
  });
}

export function trackFormStart() {
  trackEvent("assessment_intake_start", {
    form_id: "homepage_assessment_intake",
  });
}

export function trackFormSubmitSuccess() {
  trackEvent("assessment_intake_submit_success", {
    form_id: "homepage_assessment_intake",
  });
}

export function trackFormSubmitError(reason: string) {
  trackEvent("assessment_intake_submit_error", {
    form_id: "homepage_assessment_intake",
    reason,
  });
}
