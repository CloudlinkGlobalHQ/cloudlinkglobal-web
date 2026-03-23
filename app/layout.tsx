import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import { Suspense } from "react";
import PostHogProvider from "./components/PostHogProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cloudlink Global — Deploy-aware AWS cost monitoring",
  description:
    "Know instantly when a deploy costs you money. Cloudlink ties AWS cost changes directly to deployments so engineering teams catch expensive regressions early — before the bill compounds.",
  metadataBase: new URL("https://cloudlinkglobal.com"),
  openGraph: {
    title: "Cloudlink Global — Deploy-aware AWS cost monitoring",
    description:
      "Know instantly when a deploy costs you money. Cloudlink ties AWS cost changes directly to deployments so engineering teams catch expensive regressions early.",
    url: "https://cloudlinkglobal.com",
    siteName: "Cloudlink Global",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cloudlink Global — Deploy-aware AWS cost monitoring",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloudlink Global — Deploy-aware AWS cost monitoring",
    description:
      "Know instantly when a deploy costs you money. Cloudlink ties AWS cost changes directly to deployments so engineering teams catch expensive regressions early.",
    images: ["/og-image.png"],
  },
  keywords: [
    "AWS cost monitoring",
    "deploy cost tracking",
    "cloud cost regression",
    "AWS Cost Explorer alternative",
    "engineering cost observability",
    "cloud spend management",
  ],
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ perspective: 1200 }}
      >
        <ClerkProvider>
          <Suspense fallback={null}>
            <PostHogProvider />
          </Suspense>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </ClerkProvider>
      </body>
    </html>
  );
}
