# Verify Google AdSense Across Every Page

The requested Google AdSense script is already present in the shared site `<head>` with publisher ID `ca-pub-8663841786047317`. Because every page uses that shared document shell, the script is included once on every page automatically.

## Plan

- Keep the AdSense script in the shared `<head>` so it loads sitewide without duplicate requests.
- Confirm the script retains `async` and `crossorigin="anonymous"` exactly as requested.
- Verify a representative set of public, legal, and signed-in pages renders the AdSense script in the final document head.
- Check the preview for build or browser errors.

## Scope

No per-page duplicate scripts will be added. Adding the same AdSense loader separately to every route could initialize it multiple times, while the existing shared placement already satisfies the requirement.
