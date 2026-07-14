import { createFileRoute, Link } from "@tanstack/react-router";

const TITLE = "Refund Policy — Master Lingo";
const DESC = "Master Lingo offers a 30-day money-back guarantee on all Pro subscriptions.";
const URL = "https://masterlingo.lovable.app/legal/refund";

export const Route = createFileRoute("/legal/refund")({
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
  component: RefundPage,
});

function RefundPage() {
  return (
    <div className="bg-aurora min-h-screen">
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link> / Legal
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">Refund Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: July 14, 2026</p>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">30-day money-back guarantee</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We want you to love Master Lingo. If you're not satisfied with your Pro subscription, you can
            request a full refund within <strong>30 days</strong> of your order date — no questions asked.
            Every Pro plan also includes a 7-day free trial, so you can try the full experience before you
            are charged.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">How to request a refund</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Refunds are processed by our payment provider and Merchant of Record,{" "}
            <strong>Paddle.com</strong>. To request a refund:
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-muted-foreground">
            <li>
              Visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="underline">paddle.net</a>{" "}
              and enter the email address you used at checkout.
            </li>
            <li>Find your Master Lingo order and select "Request a refund".</li>
            <li>
              Or contact us directly via the <Link to="/help" className="underline">Contact page</Link> and
              we'll forward the request to Paddle on your behalf.
            </li>
          </ol>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Refunds are typically issued to your original payment method within 3–10 business days once
            approved.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Cancellations</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You can cancel your subscription at any time from your{" "}
            <Link to="/profile" className="underline">profile page</Link>. When you cancel, you keep
            Pro access until the end of the current billing period; you will not be billed again.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold tracking-tight">Questions?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            For anything else, reach us through the{" "}
            <Link to="/help" className="underline">Contact page</Link> — we respond within 24 hours.
          </p>
        </section>
      </article>
    </div>
  );
}
