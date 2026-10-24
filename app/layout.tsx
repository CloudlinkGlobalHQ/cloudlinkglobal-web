import './lib/env'
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "./components/SmoothScroll";
import { Suspense } from "react";
import PostHogProvider from "./components/PostHogProvider";
import Nav from "./components/Nav";
import AppProviders from "./components/AppProviders";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Cloudlink — Find the AWS spend nobody is using",
    template: "Cloudlink | %s",
  },
  description:
    "Cloudlink connects to your AWS account with a read-only role, finds idle and unused resources and risky settings, and shows what each fix would save per month. It cannot change anything in your account.",
  metadataBase: new URL("https://cloudlinkglobal.com"),
  openGraph: {
    title: "Cloudlink — Find the AWS spend nobody is using",
    description:
      "A read-only AWS cost tool. It finds idle and unused resources and puts a monthly dollar figure on each fix.",
    url: "https://cloudlinkglobal.com",
    siteName: "Cloudlink Global",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Cloudlink: find the AWS spend nobody is using" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cloudlink — Find the AWS spend nobody is using",
    description: "A read-only AWS cost tool. It finds idle and unused resources and puts a monthly dollar figure on each fix.",
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
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <AppProviders>
          <Suspense fallback={null}>
            <PostHogProvider />
          </Suspense>
          <SmoothScroll>
            <Nav />
            {children}
          </SmoothScroll>
        </AppProviders>
      </body>
    </html>
  );
}
