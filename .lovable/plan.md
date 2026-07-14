# Add animated visuals to lessons

Adopt Lottie (looping animated icons) across the learning flow, styled to match the Duolingo-like reference.

## What gets added

1. **Learn phase** — large animation next to each new word (☕ steaming cup, 👋 waving hand, 🥐 flaky croissant, A/1/👋 for foundations).
2. **Quiz phase** — Duolingo-style image tiles: instead of 4 text options, show 3 animated tiles; the correct one matches the prompt word. Falls back to text options when no animation is mapped for a word.
3. **Lesson path** (`/learn`) — themed animated icon per lesson node: alphabet (dancing letters), numbers (counter), greetings (wave), grammar (gears), review (trophy).
4. **Completion screen** — celebratory confetti + trophy animation replacing the current static sparkles.

## Tech approach

- Add `@lottiefiles/dotlottie-react` (~15 KB gzipped, no runtime deps beyond React).
- Store `.lottie` files as **Lovable Assets** (CDN pointers, not repo bytes). Curated set from lottiefiles.com free library, ~25 animations to start:
  - Foundations: `letter-a`, `number-1`, `wave-hello`, `handshake`, `clock`
  - Common vocab: `coffee`, `tea`, `croissant`, `bread`, `water`, `apple`, `dog`, `cat`, `sun`, `moon`, `house`, `car`, `book`, `phone`, `heart`
  - UI: `trophy`, `confetti`, `sparkle-loop`, `flame` (streak), `gears` (grammar)
- Central mapping in `src/data/animations.ts`: `Record<string /* english translation key */, AssetPointer>`. Lookup by normalized `word.translation` so all 5 languages share one asset (café / Kaffee / coffee → same coffee animation).
- New `<LottieIcon name="coffee" size={160} />` component wrapping DotLottieReact with `loop autoplay`, respecting `prefers-reduced-motion` (freeze on first frame).

## File changes

- **New** `src/data/animations.ts` — key→asset pointer map + `getAnimationFor(word)` helper.
- **New** `src/assets/lottie/*.lottie.asset.json` — ~25 asset pointers.
- **New** `src/components/LottieIcon.tsx` — reusable player.
- **Edit** `src/routes/_authenticated/learn/$lessonId.tsx`:
  - Learn phase: render `<LottieIcon>` above the word.
  - Quiz phase: if all 3 options have animations, render tile grid (image + label, correct-answer highlighting matches current style); else keep text buttons.
  - Completion: swap `<Sparkles>` for confetti + trophy Lottie.
- **Edit** `src/routes/_authenticated/learn/index.tsx` — replace lesson-node emoji with a small Lottie per topic category (detected from topic id: `-alphabet`, `-numbers`, `-greeting`, `-grammar`, `-review`, else generic book).

## Performance & fallbacks

- Lottie files preloaded with `<link rel="prefetch">` for the current lesson's deck only (5–8 files, ~200 KB total).
- Lesson path uses 1 Lottie per *category* (5 total), not per node, so scroll stays smooth.
- If `getAnimationFor(word)` returns null (uncommon vocab), the card renders the emoji/word only — no broken UI.
- `prefers-reduced-motion`: static first frame; screen-reader label from the English translation.

## Out of scope

- No videos (per your choice).
- No AI-generated per-word images.
- No content changes to lessons themselves — only visual layer.

Approve to build.
