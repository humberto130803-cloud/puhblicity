"use client";

import { usePathname } from "next/navigation";
import SiteHeader from "@/components/site-header";

/** The board and the admin panel run the dark topbar; everything else, light. */
export default function Chrome() {
  const pathname = usePathname();
  const dark = pathname === "/" || pathname.startsWith("/admin");
  return <SiteHeader dark={dark} />;
}
