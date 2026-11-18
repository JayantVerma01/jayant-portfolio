import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { ThemeProvider, themeInitScript } from "@/components/ThemeProvider";
import SmoothScroll from "@/components/SmoothScroll";
import { personalInfo } from "@/lib/data";

const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jayant Verma — Full Stack & AI Engineer",
    template: "%s | Jayant Verma",
  },
  description:
    "Jayant Verma is a Full Stack and AI engineer from Jaipur building production web apps with Next.js, Node.js and RAG/LLM pipelines. See selected work, experience and get in touch.",
  keywords: [
    "Jayant Verma",
    "Full Stack Developer",
    "AI Engineer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "RAG",
    "LangGraph",
    "Jaipur",
    "Portfolio",
  ],
  authors: [{ name: "Jayant Verma" }],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Jayant Verma — Full Stack & AI Engineer",
    description:
      "Production web apps and AI features, end to end. Next.js, Node.js, RAG and LangGraph.",
    type: "website",
    siteName: "Jayant Verma",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jayant Verma — Full Stack & AI Engineer",
    description:
      "Production web apps and AI features, end to end. Next.js, Node.js, RAG and LangGraph.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0d17" },
    { media: "(prefers-color-scheme: light)", color: "#f3efe7" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: personalInfo.name,
  jobTitle: personalInfo.role,
  url: SITE_URL,
  email: `mailto:${personalInfo.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Jaipur", addressCountry: "IN" },
  sameAs: [personalInfo.github, personalInfo.linkedin],
  knowsAbout: ["Next.js", "React", "Node.js", "TypeScript", "RAG", "LangGraph", "FastAPI"],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body suppressHydrationWarning>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
