import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PUHBLICITY — name your price. Do the thing.",
    short_name: "PUHBLICITY",
    description:
      "A public board where people crowdfund each other's small, self-inflicted, funny acts. Post a dare, set your price, watch the pot fill.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#14202E",
    theme_color: "#14202E",
    categories: ["social", "entertainment"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Post a dare", short_name: "Post", url: "/create" },
      { name: "My dares", short_name: "Mine", url: "/mine" },
    ],
  };
}
