import { Suspense } from "react";
import { VariantSwitcher } from "./_components/VariantSwitcher";

export default function DemoPage() {
  return (
    <Suspense>
      <VariantSwitcher />
    </Suspense>
  );
}
