import { describe, expect, it } from "vitest";
import { inspectMarketplaceListing } from "@/lib/marketplaceInspector";

describe("inspectMarketplaceListing", () => {
  it("detects known marketplace platform and extracts details", () => {
    const html = `
      <html>
        <head>
          <title>eBay Listing - Vintage Camera</title>
          <meta property="product:price:amount" content="$250.00" />
        </head>
        <body>
          Seller: John Doe
          Location: London
          Please continue on WhatsApp for fast deal.
        </body>
      </html>
    `;

    const inspection = inspectMarketplaceListing(
      "https://www.ebay.com/itm/123456",
      html,
      "Vintage Camera listing"
    );

    expect(inspection.isKnownMarketplace).toBe(true);
    expect(inspection.platformName).toBe("eBay");
    expect(inspection.details.join(" ")).toContain("Marketplace Price");
    expect(inspection.riskHints).toContain("Listing asks to continue communication off-platform");
  });

  it("flags potential fake marketplace clone domains", () => {
    const html = `
      <html>
        <head><title>Secure eBay Buyer Protection</title></head>
        <body>Official eBay protection payment page</body>
      </html>
    `;

    const inspection = inspectMarketplaceListing(
      "https://secure-ebay-protection-pay.com/listing/999",
      html,
      "Official eBay protection"
    );

    expect(inspection.isKnownMarketplace).toBe(false);
    expect(inspection.riskHints).toContain("Possible fake eBay clone domain");
    expect(inspection.hardRiskSignals).toContain("Possible fake eBay clone domain");
  });

  it("recognizes Amazon product pages as a known marketplace", () => {
    const html = `
      <html>
        <head>
          <title>Beauty Serum - Amazon.com</title>
          <meta property="product:price:amount" content="$24.99" />
        </head>
        <body>Ships from Amazon.com</body>
      </html>
    `;

    const inspection = inspectMarketplaceListing(
      "https://www.amazon.com/Beauty-Serum/dp/B0CNCL35CH",
      html,
      "Beauty Serum"
    );

    expect(inspection.isKnownMarketplace).toBe(true);
    expect(inspection.platformName).toBe("Amazon");
    expect(inspection.trustSignals).toContain("Known marketplace domain: Amazon");
    expect(inspection.hardRiskSignals).toEqual([]);
  });

  it("flags fake Amazon and OLX clone domains", () => {
    const amazonInspection = inspectMarketplaceListing(
      "https://secure-amazon-checkout.example/listing/999",
      "<html><head><title>Amazon checkout</title></head><body>Amazon secure payment</body></html>",
      "Amazon checkout"
    );
    const olxInspection = inspectMarketplaceListing(
      "https://olx-delivery-pay.example/listing/999",
      "<html><head><title>OLX delivery</title></head><body>OLX secure delivery payment</body></html>",
      "OLX delivery"
    );

    expect(amazonInspection.hardRiskSignals).toContain("Possible fake Amazon clone domain");
    expect(olxInspection.hardRiskSignals).toContain("Possible fake OLX clone domain");
  });
});
