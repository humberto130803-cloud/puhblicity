import type { Metadata, Viewport } from "next";
import { Anton, Archivo, DM_Mono } from "next/font/google";
import Providers from "@/components/providers";
import Chrome from "@/components/chrome";
import SiteFooter from "@/components/site-footer";
import { ConfettiCanvas } from "@/components/confetti";
import { RegisterSW } from "@/components/register-sw";
import { InstallHint } from "@/components/install-hint";
import { LocaleProvider } from "@/components/locale-provider";
import { getT } from "@/lib/i18n";
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

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { ...baseMetadata, title: t.meta.title, description: t.meta.description };
}

const baseMetadata: Metadata = {
  metadataBase: new URL("https://puhblicity.vercel.app"),
  applicationName: "PUHBLICITY",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  // Installed to a home screen, this runs with no browser chrome at all.
  appleWebApp: {
    capable: true,
    title: "PUHBLICITY",
    statusBarStyle: "black-translucent",
  },
  // Next emits the modern `mobile-web-app-capable`; older iOS only honours
  // Apple's original spelling, and without it the installed app still shows
  // Safari's chrome. Cheap insurance.
  other: { "apple-mobile-web-app-capable": "yes" },
  openGraph: {
    type: "website",
    siteName: "PUHBLICITY",
    title: "PUHBLICITY — name your price. Do the thing.",
    description:
      "Post a dare. Strangers fill the pot. Do the thing and get paid — or every backer gets it all back.",
    images: ["/splash.png"],
  },
  twitter: { card: "summary_large_image", images: ["/splash.png"] },
};

export const viewport: Viewport = {
  themeColor: "#14202E",
  // cover + the safe-area padding in globals.css: without this the standalone
  // app runs its content under the notch and the home indicator.
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { locale } = await getT();
  return (
    // The font variables MUST land on <html>: globals.css builds
    // --font-display/-body/-mono from them at :root, and a custom property
    // that references an undefined variable is invalid at computed-value
    // time — which silently dropped the whole site to Times.
    <html lang={locale} className={`${anton.variable} ${archivo.variable} ${dmMono.variable}`}>
      <body>
        <LocaleProvider locale={locale}>
          <Providers>
            <ConfettiCanvas />
            <Chrome />
            <main>{children}</main>
            <SiteFooter />
            <InstallHint />
            <RegisterSW />
          </Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
