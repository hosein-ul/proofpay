import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { PRODUCT_NAME, SITE_URL, TAGLINE } from "@/lib/config";

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${PRODUCT_NAME} — ${TAGLINE}`, template: `%s · ${PRODUCT_NAME}` },
  description:
    "Escrow that releases funds only when a cryptographic proof shows the agreed outcome happened. Proofs by Primus zkTLS. Testnet beta.",
  applicationName: PRODUCT_NAME,
  openGraph: { type: "website", siteName: PRODUCT_NAME },
  twitter: { card: "summary_large_image" },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#edf1f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1326" },
  ],
};

/** Sets data-theme before paint so there is no flash. "system" = no attribute. */
const themeScript = `try{var t=localStorage.getItem('pp-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;var d=localStorage.getItem('pp-density');if(d==='compact')document.documentElement.dataset.density='compact'}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-control focus:bg-raised focus:px-3 focus:py-2 focus:shadow-float"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
