import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jayant Verma — Full Stack Developer | Next.js, Node.js, AI",
  description:
    "Portfolio of Jayant Verma, a Full Stack Developer with 2 years of experience specializing in Next.js, React.js, Node.js, and AI integration. Building scalable, high-performance web applications.",
  keywords: [
    "Jayant Verma",
    "Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "AI Developer",
    "Portfolio",
  ],
  authors: [{ name: "Jayant Verma" }],
  openGraph: {
    title: "Jayant Verma — Full Stack Developer",
    description:
      "Building scalable web applications with Next.js, Node.js, and AI",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0d17" },
    { media: "(prefers-color-scheme: light)", color: "#f3efe7" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${sans.variable} ${mono.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
