export type Playbook = {
  id: string;
  name: string;
  match: string[];
  prevalence: string;
  typicalLoss: string;
  summary: string;
  stages: string[];
  redFlags: string[];
  recovery: string[];
};

export const PLAYBOOKS: Playbook[] = [
  {
    id: "courier-fee",
    name: "Courier Fee / Fake Shipping Scam",
    match: ["courier", "shipping fee", "delivery fee", "reimburse", "tomorrow", "out of town"],
    prevalence: "4,210 reports in the last 90 days",
    typicalLoss: "$35 – $420",
    summary: "A buyer agrees to your price, claims to be out of town, and insists on using their 'trusted courier'. They ask you to pay a small shipping fee upfront, promising to reimburse with the full payment. The payment and reimbursement never arrive.",
    stages: [
      "Buyer commits to your asking price without negotiation",
      "Buyer introduces a courier / shipping agent with a lookalike domain",
      "Seller is asked to pay a small fee via wire, Zelle, or card link",
      "Fake receipt arrives showing 'payment pending fee confirmation'",
      "Buyer stops responding; courier domain vanishes within 48h",
    ],
    redFlags: [
      "Buyer avoids platform-native shipping and offers their own courier",
      "Link domain mimics marketplace but isn't owned by it",
      "Claim that you'll be reimbursed after paying a fee",
      "Urgency: 'I need it by tomorrow', 'my courier is waiting'",
    ],
    recovery: [
      "Do NOT pay. Every legitimate courier charges the buyer, not the seller.",
      "Report the listing thread to the marketplace (eBay/Facebook/OLX).",
      "If card was used: call bank within 24h and dispute as 'services not rendered'.",
      "Keep screenshots of the entire conversation and the courier link.",
    ],
  },
  {
    id: "off-platform",
    name: "Off-platform Payment Diversion",
    match: ["zelle", "whatsapp", "wire", "cash app", "western union", "skip platform", "ebay fees"],
    prevalence: "2,840 reports in the last 90 days",
    typicalLoss: "$120 – $2,100",
    summary: "A buyer or seller pushes to move the transaction off the protected platform, usually with a small discount as bait. Payment happens via an irreversible method, and goods never ship (or the chargeback never sticks).",
    stages: [
      "Party proposes moving to WhatsApp / Telegram / personal email",
      "They cite 'platform fees' as the reason for the switch",
      "Payment request uses Zelle, wire, or gift cards (irreversible methods)",
      "After payment, counterparty goes silent or ships counterfeit",
    ],
    redFlags: [
      "Request to leave marketplace before transaction is complete",
      "Offer of a discount in exchange for off-platform payment",
      "Insistence on Zelle, wire transfer, gift cards, or crypto",
      "Unwillingness to use platform-native escrow or checkout",
    ],
    recovery: [
      "Refuse to continue off-platform. Re-engage only inside the marketplace.",
      "Report the account to the platform — off-platform steering violates ToS.",
      "If paid: Zelle/wire is usually unrecoverable. File bank dispute anyway within 48h.",
      "File FTC complaint at reportfraud.ftc.gov (US) or actionfraud.police.uk (UK).",
    ],
  },
  {
    id: "job-deposit",
    name: "Job Offer Activation Deposit",
    match: ["work from home", "onboarding kit", "activation", "refundable deposit", "data entry", "hiring"],
    prevalence: "1,920 reports in the last 90 days",
    typicalLoss: "$80 – $600",
    summary: "An unsolicited remote role with attractive weekly pay asks for a small 'refundable' deposit to activate the account or ship equipment. The deposit is permanent; the job doesn't exist.",
    stages: [
      "Unsolicited message on LinkedIn / email / WhatsApp offers a remote role",
      "Interview is minimal or happens entirely over text",
      "Small deposit requested in crypto or via gift cards",
      "'Training materials' never arrive; recruiter disappears",
    ],
    redFlags: [
      "No legitimate interview process",
      "Deposit required before the first day",
      "Crypto / gift card payment request",
      "Vague job description with unrealistic pay",
    ],
    recovery: [
      "Never pay to start a job. Legitimate employers pay you, not the other way around.",
      "Report the LinkedIn / platform profile and the contact method.",
      "Check the company name on registry sites before any communication.",
      "If crypto was sent: likely unrecoverable — preserve the wallet address for reports.",
    ],
  },
  {
    id: "bank-phish",
    name: "Bank / Delivery Phishing",
    match: ["chase", "unusual charge", "verify identity", "your card will be locked", "usps", "delivery pending", "fedex"],
    prevalence: "12,400+ reports in the last 90 days",
    typicalLoss: "Credential theft → downstream account takeover",
    summary: "SMS or email spoofs a bank or courier with an urgent 'verify' link. The link leads to a pixel-perfect login clone that harvests credentials and 2FA codes.",
    stages: [
      "Urgent SMS / email with a time limit ('within 15 min')",
      "Short lookalike domain (chase-secure-verify.info)",
      "Login page looks identical to real bank",
      "MFA prompt relays codes to attacker in real time",
    ],
    redFlags: [
      "Bank or courier linking directly to a login page via SMS",
      "Lookalike domain using hyphens or unusual TLDs",
      "Time-pressure language",
      "Page hosted on HTTP or with a very recently issued cert",
    ],
    recovery: [
      "If you entered credentials: change password and enable phishing-resistant MFA immediately.",
      "Call your bank's number from the back of your card (not the SMS link).",
      "Check statements for any charges from the last 72h and dispute unknown items.",
      "Report the text to 7726 (US) to help carriers block the sender.",
    ],
  },
  {
    id: "romance-crypto",
    name: "Romance / Pig-Butchering",
    match: ["dear", "my uncle", "arbitrage", "guaranteed daily", "trust me", "USDT"],
    prevalence: "3,100 reports — rising fast",
    typicalLoss: "$2,500 – $80,000+",
    summary: "A stranger builds an emotional connection over weeks, then introduces a 'guaranteed return' trading platform. Small wins are shown first to build trust; eventually the victim is drained.",
    stages: [
      "Wrong-number or dating-app intro from an attractive stranger",
      "Weeks of warm conversation — no financial ask",
      "Subtle intro to a 'family member' running arbitrage",
      "Small test deposit 'works' and pays back",
      "Larger deposits lock, require more fees to unlock, never return",
    ],
    redFlags: [
      "Claim of guaranteed daily returns",
      "Encouragement to invest outside a regulated broker",
      "Family-member or insider framing",
      "Pressure to keep the 'opportunity' secret",
    ],
    recovery: [
      "Stop all further transfers immediately.",
      "Screenshot the platform, wallet address, and all messages.",
      "File reports with IC3.gov (US), Action Fraud UK, or local police cybercrime.",
      "Do NOT pay 'recovery specialists' who contact you after — most are a second scam.",
    ],
  },
  {
    id: "rental-deposit",
    name: "Fake Rental Deposit",
    match: ["western union", "apartment", "security deposit", "abroad", "viewing slot"],
    prevalence: "1,400 reports in the last 90 days",
    typicalLoss: "€300 – €3,000",
    summary: "A listing below market shows attractive photos. The 'owner' is abroad and asks for a security deposit via irreversible methods before any viewing.",
    stages: [
      "Listing is priced 20–40% below comparable units",
      "Owner is unreachable by phone, writes only by email",
      "Deposit requested via Western Union / crypto before viewing",
      "Keys are promised via courier that never arrives",
    ],
    redFlags: [
      "Price well below market without explanation",
      "Owner 'abroad' refuses phone calls",
      "Pressure to secure the apartment with a deposit before visiting",
      "Stock or reverse-searchable photos",
    ],
    recovery: [
      "Never deposit before an in-person or verified video viewing.",
      "Check photos with Google Reverse Image / TinEye.",
      "Verify ownership via local property registry when available.",
      "Report to Airbnb/Craigslist and your local tenant authority.",
    ],
  },
  {
    id: "gift-card",
    name: "Gift-Card Impersonation",
    match: ["gift card", "steam", "apple card", "itunes", "code on the back"],
    prevalence: "6,200 reports in the last 90 days",
    typicalLoss: "$100 – $1,500",
    summary: "An impersonator (support, family, boss) manufactures an urgent situation requiring gift-card codes. Codes are drained within minutes of being shared.",
    stages: [
      "Urgent message from 'boss', 'IRS', 'Apple support', or a family member",
      "Story requires immediate discreet help",
      "Victim buys gift cards and shares the codes from the back",
      "Codes drained; contact vanishes",
    ],
    redFlags: [
      "Any official agency or employer asking for gift cards",
      "Urgency + secrecy combination",
      "Refusal to accept any payment method other than gift cards",
    ],
    recovery: [
      "Contact the gift-card issuer immediately — some cards can be frozen if reported within minutes.",
      "File a report with the FTC and local police (for case-number purposes).",
      "Warn others in the household — similar messages may follow.",
    ],
  },
  {
    id: "fake-escrow",
    name: "Fake Marketplace Escrow",
    match: ["avito-dostavka", "mercadolivre-pagar", "wallapop-envio", "safe deal", "secure deal", "escrow link"],
    prevalence: "2,100 reports in the last 90 days",
    typicalLoss: "$90 – $1,800",
    summary: "Scammer sends an 'official escrow' link that mimics the marketplace's brand but lives on a lookalike domain. The page harvests card data or redirects payment to a private account.",
    stages: [
      "Buyer/seller insists the transaction happens via 'secure deal' link",
      "Link uses a lookalike domain (avito-dostavka-oplata.ru, etc.)",
      "Page looks professional and even validates basic card info",
      "Funds go directly to attacker's account; marketplace has no record",
    ],
    redFlags: [
      "Escrow link outside the official marketplace app",
      "Domain that appends 'dostavka', 'pagar', 'envio', 'secure' to the brand",
      "No ability to verify the deal in the marketplace's own app",
    ],
    recovery: [
      "Never use escrow links sent in chat — open the marketplace app yourself and verify.",
      "If card was entered: call bank within 24h to freeze and dispute.",
      "Report the lookalike domain to the real marketplace's fraud team.",
    ],
  },
  {
    id: "overpayment",
    name: "Overpayment / Fake Check",
    match: ["sent too much", "refund the difference", "cashier's check", "overpaid"],
    prevalence: "740 reports in the last 90 days",
    typicalLoss: "$300 – $4,500",
    summary: "Buyer sends a check for more than the asked price, then asks for the difference back 'urgently'. The original check bounces days later, but by then the refund is gone.",
    stages: [
      "Buyer sends a check for significantly more than the price",
      "Buyer claims the overpayment was an accident and asks for a refund of the difference",
      "Seller refunds via wire or Zelle (irreversible)",
      "Original check bounces days later; bank reclaims the full amount",
    ],
    redFlags: [
      "Payment amount exceeds the asking price",
      "Urgency to return the difference before the check clears",
      "Use of personal checks for marketplace sales",
    ],
    recovery: [
      "Wait until a check clears (10+ business days) — 'funds available' does NOT mean cleared.",
      "Refuse refunds via wire or Zelle; insist on original payment method reversal.",
      "Report to bank fraud team and to FTC.",
    ],
  },
  {
    id: "crypto-recovery",
    name: "Second-layer Recovery Scam",
    match: ["recovery specialist", "recover lost crypto", "we can help get your money back"],
    prevalence: "980 reports in the last 90 days",
    typicalLoss: "$500 – $12,000",
    summary: "Victims of a prior scam are contacted by a 'recovery agent' who claims to have traced the funds. They charge an upfront fee and provide fake progress reports before disappearing.",
    stages: [
      "Scam victim posts online or is targeted via scraped data",
      "Agent claims tracing / law-enforcement connections",
      "Upfront retainer fee is requested (in crypto or wire)",
      "Agent provides screenshots of 'progress' that never materializes",
    ],
    redFlags: [
      "Unsolicited contact after a scam you've reported publicly",
      "Upfront fees for 'recovery' work",
      "Claims to be affiliated with FBI / Interpol / private investigators without verification",
    ],
    recovery: [
      "Don't pay. Legitimate recoveries charge only after successful return.",
      "Report the 'recovery' pitch itself — these are treated as a second fraud event.",
      "If you've already paid: freeze the payment method and file a report within 24h.",
    ],
  },
];

export function matchPlaybook(input: string, reasons: string[]): Playbook | null {
  const haystack = `${input} ${reasons.join(" ")}`.toLowerCase();
  let bestMatch: Playbook | null = null;
  let bestScore = 0;
  for (const playbook of PLAYBOOKS) {
    const score = playbook.match.reduce((acc, kw) => (haystack.includes(kw.toLowerCase()) ? acc + 1 : acc), 0);
    if (score > bestScore) {
      bestScore = score;
      bestMatch = playbook;
    }
  }
  return bestScore >= 1 ? bestMatch : null;
}
