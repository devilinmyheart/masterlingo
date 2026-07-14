import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Privacy Notice — Master Lingo";
const DESC = "How Master Lingo collects, uses, and protects your personal data.";
const URL = "https://masterlingo.lovable.app/legal/privacy";

export const Route = createFileRoute("/legal/privacy")({
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
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="bg-aurora min-h-screen">
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / Legal
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">Privacy Notice</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: July 14, 2026</p>

        <Section title="1. Who we are">
          <strong>Master Lingo</strong> ("Master Lingo", "we", "us") is the data controller for personal
          data collected through the Master Lingo language-learning service. You can reach us at
          Master Lingo, Maharajganj, Uttar Pradesh 273303, India, or via the{" "}
          <Link to="/help" className="underline">Contact page</Link>.
        </Section>

        <Section title="2. Personal data we collect">
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Account data</strong> — name, email, hashed password (or Google OAuth identifier), profile picture.</li>
            <li><strong>Learning data</strong> — target language, level, goals, lesson progress, XP, streaks, vocabulary, quiz answers.</li>
            <li><strong>AI interactions</strong> — messages you send to the AI tutor, speaking-practice transcripts, feedback ratings.</li>
            <li><strong>Support & feedback</strong> — messages you submit via contact and feedback forms.</li>
            <li><strong>Usage & device data</strong> — pages viewed, features used, device type, browser, IP address, approximate location.</li>
            <li><strong>Cookies</strong> — see the Cookies section below.</li>
          </ul>
        </Section>

        <Section title="3. Why we use your data (purposes & legal basis)">
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li><strong>Provide the service</strong> — create your account, deliver lessons, run the AI tutor. Legal basis: performance of a contract.</li>
            <li><strong>Personalize your learning</strong> — adapt lessons to your level and goals. Legal basis: legitimate interests / consent.</li>
            <li><strong>Support & feedback</strong> — respond to your messages. Legal basis: legitimate interests.</li>
            <li><strong>Security & fraud prevention</strong> — detect abuse, protect accounts. Legal basis: legitimate interests / legal obligation.</li>
            <li><strong>Product improvement</strong> — analytics on aggregate usage. Legal basis: legitimate interests.</li>
            <li><strong>Legal compliance</strong> — tax, accounting, regulatory requests. Legal basis: legal obligation.</li>
            <li><strong>Marketing</strong> — only where you have consented; you can unsubscribe at any time.</li>
          </ul>
        </Section>

        <Section title="4. Who we share your data with">
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li><strong>Merchant of Record — Paddle.com Market Limited</strong>: processes payments, subscriptions, tax, invoicing, and refunds on our behalf.</li>
            <li><strong>Hosting & infrastructure</strong>: Lovable (application hosting), Supabase (database, authentication, storage).</li>
            <li><strong>AI providers</strong>: Google (Gemini) to power the AI tutor, speaking analysis, and content generation.</li>
            <li><strong>Analytics & advertising</strong>: Google (AdSense/Analytics) for aggregate analytics and advertising on the free plan.</li>
            <li><strong>Professional advisers</strong>: legal, tax, and accounting advisers where necessary.</li>
            <li><strong>Authorities</strong>: where required by law or to protect rights and safety.</li>
          </ul>
          We do not sell your personal data.
        </Section>

        <Section title="5. International transfers">
          Your data may be transferred to and processed in countries outside your own, including the United
          States and the European Economic Area. Where required, we rely on appropriate safeguards such as
          Standard Contractual Clauses or adequacy decisions.
        </Section>

        <Section title="6. Retention">
          We keep your account and learning data for as long as your account is active. If you delete your
          account, we delete or anonymize your data within 90 days, except where retention is required by
          law (e.g. tax records held for up to 7 years) or for the establishment or defense of legal
          claims. Support and feedback messages are kept for up to 24 months.
        </Section>

        <Section title="7. Your rights">
          Depending on where you live, you have the right to access, rectify, erase, restrict, or port your
          personal data; to object to processing; and to withdraw consent at any time. You can exercise
          these rights from your <Link to="/profile" className="underline">profile page</Link> or by
          contacting us. EU/UK users also have the right to complain to a supervisory authority.
        </Section>

        <Section title="8. Security">
          We use appropriate technical and organizational measures to protect your data, including
          encryption in transit (HTTPS/TLS), encryption at rest, role-based access controls, row-level
          security in our database, and regular security reviews.
        </Section>

        <Section title="9. Cookies">
          We use essential cookies to keep you signed in and remember your preferences. With your consent
          we also use analytics and advertising cookies (Google AdSense/Analytics) on the free plan. You
          can change your choice at any time via the cookie banner. Master Lingo Pro subscribers see no
          advertising cookies.
        </Section>

        <Section title="10. Children">
          Master Lingo is not directed at children under 13 (or under the minimum age of digital consent
          in your country). We do not knowingly collect personal data from children without parental
          consent.
        </Section>

        <Section title="11. Changes to this Notice">
          We may update this Notice from time to time. Material changes will be notified by email or in-app.
        </Section>
      </article>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold tracking-tight">{title}</h2>
      <div className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
