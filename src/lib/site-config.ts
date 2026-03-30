export const siteConfig = {
  name: "Axion Technologies",
  domain: "axiontechnologies.ca",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://axiontechnologies.ca",
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "https://cal.com/your-handle/consultation",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@axiontechnologies.ca",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  title:
    "Axion Technologies | Modern websites, better systems, practical AI for small business",
  description:
    "Axion Technologies helps small and growing businesses modernize their website, reduce manual work, and build practical digital systems without bloated consulting.",
  keywords: [
    "small business website design",
    "AI automation for small business",
    "digital transformation for small business",
    "business process automation",
    "modern websites for local businesses",
    "small business automation consulting",
  ],
} as const;
