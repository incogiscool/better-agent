import type { Metadata } from "next";
import { Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export const metadata: Metadata = {
  title: {
    default: "BetterAgent Docs",
    template: "%s — BetterAgent Docs",
  },
  description:
    "Documentation for BetterAgent — the agent layer your SaaS is missing.",
};

const navbar = <Navbar logo={<b>betteragent</b>} />;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <Head />
      <body>
        <Layout navbar={navbar} pageMap={await getPageMap()}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
