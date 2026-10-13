import type { Metadata } from "next";
import { Figtree, Cookie } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const cookie = Cookie({
  variable: "--font-cookie",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ephileo - We build Products People Love",
    template: "%s | Ephileo",
  },
  description: "Ephileo develops beautifully designed applications that people love. Games, apps, and digital experiences crafted with care.",
  keywords: ["ephileo", "apps", "games", "mobile apps", "chain reaction", "escape game", "roamates"],
  authors: [{ name: "Ephileo" }],
  openGraph: {
    title: "Ephileo - We build Products People Love",
    description: "Beautifully designed applications that people love.",
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  alternates: {
    types: { "application/rss+xml": `${SITE_URL}/blog/rss.xml` },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  email: "admin@ephileo.us",
  sameAs: [
    "https://apps.apple.com/us/app/roamates/id6757687270",
    "https://play.google.com/store/apps/details?id=us.ephileo.roamates",
    "https://www.producthunt.com/products/roamates",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body 
        className={`${figtree.variable} ${cookie.variable} antialiased bg-black`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
