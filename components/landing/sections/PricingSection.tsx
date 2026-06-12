import { PricingCards } from "@/components/landing/PricingCards";
import { Eyebrow, WRAP, SEC, SECHEAD, H2, SUB } from "@/components/landing/primitives";

export function PricingSection() {
  return (
    <section className={SEC}>
      <div className={WRAP}>
        <div className={SECHEAD}>
          <Eyebrow>Pricing</Eyebrow>
          <h2 className={H2}>Free until your agent earns its keep.</h2>
          <p className={SUB}>
            500 credits a month on the house — ~25 conversations to prototype.
            Starter is $0.99/mo for 1,500 credits. No card required.
          </p>
        </div>
        <PricingCards />
      </div>
    </section>
  );
}
