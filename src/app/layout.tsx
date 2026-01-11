import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Ephileo - Build Products People Love",
  description: "Ephileo develops beautifully designed applications that people love. Games, apps, and digital experiences crafted with care.",
  keywords: ["ephileo", "apps", "games", "mobile apps", "chain reaction", "escape game", "roamates"],
  authors: [{ name: "Ephileo" }],
  openGraph: {
    title: "Ephileo - Build Products People Love",
    description: "Beautifully designed applications that people love.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${figtree.variable} antialiased bg-black`}
      >
        {children}
      </body>
    </html>
  );
}
