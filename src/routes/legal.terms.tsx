import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Terms & Conditions — Master Lingo";
const DESC = "The terms that govern your use of Master Lingo's AI-powered language learning service.";
const URL = "https://masterlingo.lovable.app/legal/terms";

export const Route = createFileRoute("/legal/terms")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:url", content: URL },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="bg-aurora min-h-screen">
      <article className="prose-legal mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / Legal
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: July 14, 2026</p>

        <Section title="1. Who you are contracting with">
          These Terms & Conditions govern your access to and use of the Master Lingo service (the "Service"),
          operated by <strong>Master Lingo</strong> ("Master Lingo", "we", "us"). By creating an account or
          continuing to use the Service you agree to be bound by these Terms.
        </Section>

        <Section title="2. Eligibility & account">
          You must be old enough to form a binding contract in your jurisdiction or have parental consent.
          If you use the Service on behalf of an organization you confirm you have authority to bind it.
          You are responsible for keeping your login credentials confidential and for any activity under your
          account. Provide accurate information and keep it up to date.
        </Section>

        <Section title="3. The Service">
          Master Lingo provides AI-powered language learning across English, French, German, Japanese, and
          English for Hindi speakers, including lessons, an AI tutor, speaking practice, and roleplay
          conversations. Features and content may change over time.
        </Section>

        <Section title="4. Acceptable use">
          You must not misuse the Service. Prohibited behavior includes, without limitation: using the
          Service unlawfully; fraud or spam; infringing intellectual property; interfering with security
          (malware, probing, scraping, denial of service); attempting to reverse engineer the Service;
          reselling or redistributing access; or circumventing technical limits.
        </Section>

        <Section title="5. AI features & user responsibility">
          The Service uses generative AI to explain grammar, generate examples, and roleplay conversations.
          You are responsible for your prompts, how you use AI-generated outputs, verifying accuracy, and
          for having the rights to any content you submit. You must not use the Service to generate illegal
          content, deepfakes, hate speech, harassment, malware, or to jailbreak the underlying models.
          <br /><br />
          <strong>Accuracy disclosure.</strong> AI outputs may be inaccurate, incomplete, or out of date and
          are not a substitute for regulated professional advice (legal, medical, financial). We reserve the
          right to moderate content, refuse or filter outputs, and suspend accounts that repeatedly infringe
          third-party rights or violate these Terms.
        </Section>

        <Section title="6. User content">
          You keep ownership of the content you submit (writing samples, recordings, prompts). You grant
          Master Lingo a limited, worldwide, royalty-free license to host, process, and display that content
          solely to provide the Service to you.
        </Section>

        <Section title="7. Intellectual property">
          Master Lingo and its licensors retain all right, title, and interest in the Service, including the
          software, curriculum, branding, and documentation. We grant you a limited, non-exclusive,
          non-transferable right to use the Service within your selected plan.
        </Section>

        <Section title="8. Payments, subscriptions, and refunds">
          Our order process is conducted by our online reseller <strong>Paddle.com</strong>. Paddle.com is
          the Merchant of Record for all our orders. Paddle provides all customer service inquiries and
          handles returns. Payment, billing, taxes, cancellations, and refund mechanics are governed by
          Paddle's <a href="https://www.paddle.com/legal/checkout-buyer-terms" target="_blank" rel="noopener noreferrer" className="underline">Buyer Terms</a>.
          See our <Link to="/legal/refund" className="underline">Refund Policy</Link> for how to request a refund.
        </Section>

        <Section title="9. Service level">
          The Service is provided on an "as is" and "as available" basis. We do not guarantee that the
          Service will be uninterrupted, error-free, or meet your specific requirements. To the fullest
          extent permitted by law, we disclaim all implied warranties, including merchantability and
          fitness for a particular purpose.
        </Section>

        <Section title="10. Suspension and termination">
          We may suspend or terminate your access to the Service for material breach of these Terms,
          non-payment, security or fraud risk, or repeated or serious policy violations. On termination,
          your right to use the Service ends immediately; you may request an export of your account data
          within 30 days before it is deleted.
        </Section>

        <Section title="11. Limitation of liability">
          To the fullest extent permitted by law, our aggregate liability arising out of or relating to
          the Service is capped at the fees you paid to us in the 12 months preceding the claim. We are
          not liable for indirect, consequential, or special damages, including loss of profits, data, or
          goodwill. Nothing in these Terms excludes liability for fraud, death, or personal injury caused
          by negligence where such exclusion is prohibited by law.
        </Section>

        <Section title="12. Indemnity">
          You agree to indemnify and hold Master Lingo harmless from claims arising out of your content,
          unlawful use of the Service, or breach of these Terms.
        </Section>

        <Section title="13. Governing law">
          These Terms are governed by the laws of India. The courts of Maharajganj, Uttar Pradesh have
          exclusive jurisdiction over any disputes, subject to mandatory consumer-protection laws in your
          country of residence.
        </Section>

        <Section title="14. Changes to these Terms">
          We may update these Terms from time to time. If changes are material we will notify you by email
          or in-app before they take effect. Your continued use of the Service after changes take effect
          constitutes acceptance.
        </Section>

        <Section title="15. Contact">
          Questions about these Terms? Reach us via the <Link to="/help" className="underline">Contact page</Link>{" "}
          or write to Master Lingo, Maharajganj, Uttar Pradesh 273303, India.
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </section>
  );
}
