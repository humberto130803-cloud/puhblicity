import type { Metadata } from "next";
import { Anton, Archivo, DM_Mono } from "next/font/google";
import Providers from "@/components/providers";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
});
const dmMono = DM_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: "PUHBLICITY — name your price. Do the thing.",
  description:
    "A public board where people crowdfund each other's small, self-inflicted, funny acts. Post a dare, set a target in SOL, and let the internet fill the bar.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${archivo.variable} ${dmMono.variable}`}>
        <Providers>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
