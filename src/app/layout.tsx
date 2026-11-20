import type { Metadata } from "next";
import "./globals.css";
import "./styles/lbf/styles.css";
import { IconSprite } from "@/components/lbf/IconSprite";

const SITE_URL = "https://learnbeingforward.in";
const SITE_DESCRIPTION =
  "Learn Being Forward delivers placement-focused technical training to school students, college and university students, and corporate freshers through direct campus and corporate partnerships.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Learn Being Forward — Placement-Focused Technical Training",
    template: "%s | Learn Being Forward",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Learn Being Forward",
    title: "Learn Being Forward — Placement-Focused Technical Training",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: "Learn Being Forward — Placement-Focused Technical Training",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
