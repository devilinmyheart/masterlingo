Plan: Integrate Google AdSense Auto Ads

Goal
Add the provided AdSense script (`ca-pub-8663841786047317`) to Master Lingo so Google can automatically place ads across all pages, including public and authenticated learning pages.

Scope
- Add the AdSense loader script globally in the app shell.
- Enable Auto Ads so Google decides placement.
- Add a lightweight cookie/consent banner for EU/UK users (AdSense and EU traffic require consent under GDPR).
- Keep the change minimal and non-blocking to the learning experience.

Implementation steps

1. Global AdSense script
   - Inject the provided `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8663841786047317" crossorigin="anonymous"></script>` into `src/routes/__root.tsx` via the `head` `scripts` array.
   - The publisher ID is public/publishable, so it can live safely in the route head.

2. Auto Ads meta tag
   - Add the Auto Ads configuration meta tag in `__root.tsx` so Google starts placing ads automatically:
     `<meta name="google-adsense-account" content="ca-pub-8663841786047317">`

3. Cookie / consent banner
   - Create a small `CookieConsent` component stored in `src/components/CookieConsent.tsx`.
   - It records consent in `localStorage` and only renders once per browser.
   - Uses existing design tokens (glass panel, brand colors) so it matches the UI.

4. Layout safety
   - Auto Ads can inject ads between DOM elements. To reduce layout-shift risk on lesson pages, wrap the main lesson content in a stable container and avoid fixed-height constraints that break when ad slots are injected.
   - No manual ad unit components are required because Auto Ads handles placement.

5. Verification
   - Confirm the script tag appears in the HTML `<head>` on the landing page, dashboard, and a lesson page.
   - Confirm no console errors from the AdSense loader.
   - Confirm the cookie banner renders and can be dismissed.

Files to change
- `src/routes/__root.tsx` — add AdSense script + meta tag.
- `src/components/CookieConsent.tsx` — new consent banner.
- `src/routes/__root.tsx` or `src/router.tsx` — mount the banner in the root component.

Out of scope (can be added later)
- Manual ad unit components for specific placements.
- Premium "remove ads" subscription gate.
- Ad blocker detection or revenue recovery.

Risks / notes
- Auto Ads on active lesson pages can be distracting. If learner retention drops, we can later restrict ads to public + dashboard pages only.
- AdSense review may take time; ads typically appear after Google approves the site.
- EU traffic requires the consent banner to avoid policy issues.