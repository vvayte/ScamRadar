import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";

export const metadata = {
  title: "Terms of Service | ScamRadar",
};

export default function TermsPage() {
  return (
    <div className="site-shell flex min-h-screen flex-col text-white">
      <PublicHeader />
      <main className="flex-1 px-4 py-10 md:px-6">
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-white/8 bg-white/[0.025] p-6 md:p-10">
          <h1 className="text-3xl font-bold md:text-4xl">Terms of Service</h1>

          <div className="mt-6 space-y-6 text-sm leading-7 text-white/75 md:text-base">
            <p>
              Effective date: April 23, 2026. By using ScamRadar, you agree to these
              Terms of Service. If you do not agree, do not use the service.
            </p>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">1. Service scope</h2>
              <p>
                ScamRadar provides automated risk analysis for text, links, and listing images.
                Results are informational and do not constitute legal, financial, or law-enforcement advice.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">2. User responsibilities</h2>
              <p>
                You are responsible for content you submit and for your own decisions.
                You agree not to misuse the service, attempt unauthorized access, or submit
                harmful/illegal content.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">3. Accounts and purchases</h2>
              <p>
                Paid features are processed through Stripe. Pricing, credits, and subscription
                availability may change over time. You are responsible for applicable taxes and
                payment obligations.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">4. No guarantee</h2>
              <p>
                ScamRadar does not guarantee that every scam is detected or that every flagged
                item is malicious. You should independently verify high-risk situations before
                sending money or personal data.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">5. Acceptable use</h2>
              <p>
                You may not reverse engineer, scrape, overload, or abuse the API/service.
                We may block, throttle, or terminate access for suspicious or abusive usage.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">6. Limitation of liability</h2>
              <p>
                To the maximum extent permitted by law, ScamRadar is provided on an &quot;as is&quot;
                basis and is not liable for indirect, incidental, or consequential damages
                arising from use of the service.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">7. Termination</h2>
              <p>
                We may suspend or terminate access if these terms are violated or if
                security/operational risks require immediate action.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-bold text-white">8. Updates to terms</h2>
              <p>
                We may update these terms. Continued use after updates means acceptance
                of the revised terms.
              </p>
            </section>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
