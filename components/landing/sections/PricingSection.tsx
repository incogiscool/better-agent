import { PricingCards } from "@/components/landing/PricingCards";
import { NeedMoreCreditsNote } from "@/components/landing/NeedMoreCreditsNote";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";

export function PricingSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Pricing</Eyebrow>
          <h2 className={H2}>Free until your agent earns its keep.</h2>
          <p className={SUB}>
            500 credits every 30 days on the house, free to prototype.
            Starter is $0.99/mo for 1,500 credits. No card required.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <PricingCards />
          <NeedMoreCreditsNote source="landing" />
        </div>
      </div>
    </section>
  );
}
