import { headers } from "next/headers";
import { currencyForCountry, detectCountry } from "@/lib/billing";
import PricingPageClient from "@/components/PricingPageClient";

export default function PricingPage() {
  const country = detectCountry(headers());
  const currency = currencyForCountry(country);
  return <PricingPageClient currency={currency} />;
}
