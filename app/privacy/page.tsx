import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | ScamRadar",
};

export default function PrivacyPage() {
  return (
    <main className="site-shell min-h-screen px-4 py-10 text-white md:px-6">
      <div className="mx-auto w-full max-w-4xl rounded-3xl border border-white/12 bg-black/35 p-6 md:p-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-3xl font-black md:text-5xl">Privacy Policy</h1>
          <Link href="/" className="text-sm text-white/70 transition hover:text-white">
            Back to app
          </Link>
        </div>

        <div className="space-y-6 text-sm leading-7 text-white/80 md:text-base">
          <p>
            Effective date: April 23, 2026. This Privacy Policy explains how ScamRadar
            collects, uses, and protects information when you use our website and scam
            analysis services.
          </p>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">1. Information we process</h2>
            <p>
              We process text, links, and images that you submit for scam analysis.
              We may also process technical metadata such as IP-derived request data,
              browser/device information, and rate-limit logs to keep the service secure.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">2. How we use data</h2>
            <p>
              Submitted content is used to generate risk scores and recommendations,
              improve fraud-detection quality, prevent abuse, and maintain platform reliability.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">3. Third-party processors</h2>
            <p>
              ScamRadar uses third-party services for AI processing, hosting, analytics,
              and payments (including OpenAI and Stripe). These providers may process
              data under their own terms and privacy policies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">4. Payments</h2>
            <p>
              Payment details are handled by Stripe. ScamRadar does not store full card
              numbers or card security codes on its own servers.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">5. Data retention</h2>
            <p>
              We retain data only as long as reasonably needed for service operation,
              abuse prevention, legal compliance, and dispute resolution.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">6. Your rights</h2>
            <p>
              Depending on your jurisdiction, you may request access, correction, deletion,
              or restriction of personal data. You may also object to certain processing activities.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">7. Security</h2>
            <p>
              We use technical and organizational safeguards, including request hardening,
              validation, and abuse controls. No system is 100% secure, so use the service
              with appropriate caution.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-bold text-white">8. Contact</h2>
            <p>
              For privacy requests, contact your support address configured for production
              launch.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
