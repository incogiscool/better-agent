import { ComponentGallery } from "@/components/landing/ComponentGallery";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";

export function ComponentsSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Components, not chatbots</Eyebrow>
          <h2 className={H2}>A shadcn-style registry of agent UI.</h2>
          <p className={SUB}>
            Pick a layout, run{" "}
            <code className="font-mono text-[13px] bg-muted border border-border rounded-[5px] px-2 py-px">
              betteragent add
            </code>
            , and you own the code. Theming inherits from your shadcn tokens.
          </p>
        </div>
        <ComponentGallery showCta />
      </div>
    </section>
  );
}
