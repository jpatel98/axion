import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "Axion",
    description: siteConfig.description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#0b1121",
    theme_color: "#111827",
    icons: [
      {
        src: "/axion-logo-icon.png",
        sizes: "520x520",
        type: "image/png",
      },
      {
        src: "/axion-logo-full.png",
        sizes: "1024x1024",
        type: "image/png",
      },
    ],
  };
}
