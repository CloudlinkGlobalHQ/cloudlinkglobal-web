import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import { Suspense } from "react";
import PostHogProvider from "./components/PostHogProvider";
import Nav from "./components/Nav";

export const metadata: Metadata = {
  title: "Cloudlink Global — Stop Paying for Cloud Waste",
  description:
    "Cloudlink connects to your AWS, Azure, or GCP account and automatically detects cost regressions, idle resources, and misconfigurations — then fixes them. You keep 85% of everything we save.",
  metadataBase: new URL("https://cloudlinkglobal.com"),
  openGraph: {
    title: "Cloudlink Global — Stop Paying for Cloud Waste",
    description:
      "We only get paid when you save money. 15% of verified savings. Zero if we save you zero.",
    url: "https://cloudlinkglobal.com",
    siteName: "Cloudlink Global",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cloudlink Global" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloudlink Global — Stop Paying for Cloud Waste",
    description: "We only get paid when you save money. 15% of verified savings.",
    images: ["/og-image.png"],
  },
  keywords: [
    "AWS cost monitoring", "cloud cost optimization", "FinOps", "deploy cost tracking",
    "cloud waste reduction", "AWS Cost Explorer alternative", "cloud savings",
  ],
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ClerkProvider>
          <Suspense fallback={null}>
            <PostHogProvider />
          </Suspense>
          <SmoothScroll>
            <Nav />
            {children}
          </SmoothScroll>
        </ClerkProvider>
      </body>
    </html>
  );
}
