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
  });
});
