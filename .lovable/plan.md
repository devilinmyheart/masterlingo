## Goal

Let Master Lingo accept real payments from learners — including **UPI** and **credit/debit cards** — for the Basic ($1/mo, single language) and Pro (all languages) tiers already shown on the landing page.

## Recommended provider: Paddle (Merchant of Record)

The eligibility check confirms Master Lingo (AI-powered language learning SaaS) is a clean fit for Paddle. For your situation it's the right pick because:

- **UPI + cards + wallets built-in.** Paddle's checkout automatically shows UPI, RuPay/Visa/Mastercard, Apple/Google Pay, and local wallets to Indian buyers — no extra config.
- **You're based in India (Maharajganj, UP).** Paddle acts as the Merchant of Record, so *Paddle* handles GST, international tax registration, invoicing, refunds, and chargebacks on every sale worldwide. You just receive payouts.
- **Global by default.** Learners from any country can pay in their local currency; Paddle converts and settles to you.
- **Flat pricing:** 5% + 50¢ per transaction, all-inclusive (special reduced pricing for small/microtransactions like your $1 tier).

Stripe is the alternative, but as an India-based seller you'd lose Stripe's "managed payments" tax handling (only 36 seller countries qualify, India isn't one), meaning you'd be responsible for GST registration, filing, and remittance yourself. Paddle avoids all of that.

## What happens when you approve

1. **Enable Paddle** — creates a sandbox (test) environment instantly so we can build and test without real money. Going live later requires a short Paddle verification (business details, bank account for payouts).
2. **Create products in Paddle** — I'll set up:
   - Basic — $1/month (single language)
   - Pro — the price you want for all-languages access (please confirm the monthly price; the landing page currently just says "All languages")
   - Optional yearly variants at a discount
3. **Build checkout in the app**:
   - "Upgrade" buttons on `/pricing` and inside the authenticated app open Paddle's overlay checkout (UPI, cards, wallets all appear automatically for Indian users).
   - Success redirect + a `subscriptions` table in Lovable Cloud to record active plan per user.
4. **Webhook handler** at `/api/public/paddle-webhook` to keep subscription status in sync (activated, renewed, canceled, past_due).
5. **Entitlement gating** — a `useSubscription()` hook + server check so Pro-only features (e.g. access to all 5 language tracks, unlimited AI tutor turns) unlock only for paying users. I'll ask you which features should be free vs paid before wiring the gates.
6. **Customer portal link** in Profile so users can manage/cancel their subscription.

## Questions before I build

1. Confirm the **Pro monthly price** (e.g. $9.99/mo?) and whether you want a yearly option.
2. Which features should be **Pro-only** vs free? (Suggested: free = 1 language + limited daily lessons; Pro = all 5 languages, unlimited AI tutor, conversation practice, certifications page.)
3. Do you want a **7-day free trial** on Pro?

Reply with answers (or "use your suggestions") and I'll enable Paddle and start building.