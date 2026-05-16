import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Jayant Verma — Full Stack Developer | Next.js, Node.js, AI",
  description:
    "Portfolio of Jayant Verma, a Full Stack Developer with 1.5+ years of experience specializing in Next.js, React.js, Node.js, and AI integration. Building scalable, high-performance web applications.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider>{children}</ThemeProvider>
        <div className="noise-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
