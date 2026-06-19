import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, credit-based pricing for BetterAgent — Free, Starter, Plus, and Enterprise plans with metered overage. Pick a plan and ship an agent inside your SaaS today.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
