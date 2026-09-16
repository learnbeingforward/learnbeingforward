import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

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
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">{children}</body>
    </html>
  );
}
