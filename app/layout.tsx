import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";

const jetbrainsMono = JetBrains_Mono({subsets:['latin'],variable:'--font-mono'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://betteragent.dev",
  ),
  title: {
    default: "BetterAgent — the agent layer your SaaS is missing",
    template: "%s — BetterAgent",
  },
  description:
    "Point BetterAgent at your codebase. It reads your routes and server actions, generates the schemas, drops in the chat components — and your users get an agent that does real work inside the product you already shipped.",
  keywords: [
    "BetterAgent",
    "Next.js AI agent",
    "AI agent layer for SaaS",
    "AI agent infrastructure",
    "Next.js agent framework",
    "in-app AI agent",
    "agentic SaaS",
    "chat agent for SaaS product",
  ],
};

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BetterAgent",
  url: "https://betteragent.dev",
  logo: "https://betteragent.dev/icon.png",
  description:
    "BetterAgent is the agent layer for Next.js SaaS products — it reads your routes and server actions, generates schemas, and drops in chat components so your users get an agent that does real work inside your app.",
  sameAs: [
    "https://github.com/incogiscool/better-agent",
    "https://www.npmjs.com/package/betteragent-react",
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
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-mono", jetbrainsMono.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
