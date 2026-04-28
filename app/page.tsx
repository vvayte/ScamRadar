"use client";

import { useState } from "react";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import WhatWeDetect from "@/components/sections/WhatWeDetect";
import Examples, { type SampleKey } from "@/components/sections/Examples";
import TrustSection from "@/components/sections/TrustSection";
import Pricing from "@/components/sections/Pricing";
import FAQ from "@/components/sections/FAQ";
import CheckerCard from "@/components/checker/CheckerCard";

const SAMPLE_TEXT: Record<SampleKey, string> = {
  marketplace:
    "Hi! I'd love to buy your iPhone. I'm out of town so I'll send a courier tomorrow — please pay the $45 shipping via this link first: fb-marketp1ace-delivery.co/confirm",
  job:
    "Congratulations! You've been selected for our part-time data-entry role at $680/week. To receive your onboarding kit, please send 0.005 BTC to wallet bc1q...",
  safe:
    "Hey, I can pick up the bike tomorrow at 3pm — happy to pay through the marketplace's secure checkout. Should I bring cash as backup just in case?",
};

export default function HomePage() {
  const [autorunText, setAutorunText] = useState<string | null>(null);

  const handleTrySample = (key: SampleKey) => {
    setAutorunText(SAMPLE_TEXT[key]);
    requestAnimationFrame(() => {
      document.getElementById("checker-card")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <>
      <Hero>
        <CheckerCard
          id="checker-card"
          autorunSampleText={autorunText}
          onConsumed={() => setAutorunText(null)}
        />
      </Hero>
      <HowItWorks />
      <WhatWeDetect />
      <Examples onTry={handleTrySample} />
      <TrustSection />
      <Pricing />
      <FAQ />
    </>
  );
}
