import { headers } from "next/headers";
import { currencyForCountry, detectCountry } from "@/lib/billing";
import LandingPageClient from "@/components/LandingPageClient";

export default function HomePage() {
  const country = detectCountry(headers());
  const currency = currencyForCountry(country);
  return <LandingPageClient currency={currency} />;
}
