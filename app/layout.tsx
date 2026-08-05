import type { Metadata } from "next";
import { Anton, Archivo, DM_Mono } from "next/font/google";
import Providers from "@/components/providers";
import Chrome from "@/components/chrome";
import SiteFooter from "@/components/site-footer";
import { ConfettiCanvas } from "@/components/confetti";
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
    "You say what you'll do. The internet decides what it's worth. Hit your target and you're paid — miss it and every backer gets their SOL back, all of it.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${archivo.variable} ${dmMono.variable}`}>
        <Providers>
          <ConfettiCanvas />
          <Chrome />
          <main>{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
