# Add Korean 🇰🇷 as a Fully Supported Language

Extend the app so Korean is a first-class track alongside French, German, Japanese, English and Hindi→English — with visual-first foundations (Hangul chart, tap-to-hear tiles, animated emoji cards) that make learning fun.

## What users will get

- **Onboarding**: pick Korean 🇰🇷 as primary or secondary language.
- **Learn path**: Foundations (Hangul consonants, Hangul vowels, Numbers 1–10) → Greetings → Food & Drink → Family → Travel basics → end-of-level quiz. Alphabet lessons use the same single-page tap-to-hear grid used for Japanese kana.
- **Vocabulary**: ~60 seed words with Hangul + romanization + English meaning, each mapped to an animated emoji (☕ 커피, 🍚 밥, 👋 안녕하세요 …) so cards feel lively.
- **Conversations**: 4 roleplay scenarios (café order, asking directions, self-intro, shopping) in Korean with English gloss.
- **Tutor / Speaking / Review**: Gemini prompts get a Korean persona (Hangul first, romanization in parens, English explanations).
- **Certifications**: TOPIK I & II cards on the certifications page.
- **Voice/TTS**: `ko-KR` default voice + user override in Voice Preferences.
- **Marketing surfaces**: landing hero, footer language list, blog comparison, sitemap, JSON-LD `inLanguage` include Korean.

## Files to change

### New content
- `src/data/curriculum.ts` — add `"korean"` to `LanguageId`, add `CURRICULUM.korean` (Hangul consonants, Hangul vowels, numbers, greetings, food, family, travel, level review), append to `ALL_LANGUAGES`.
- `src/data/vocabulary.ts` — add `korean` foundation sets (Hangul jamo grid with romanization, numbers) and topic vocab (greetings, food, family, travel).
- `src/data/scenarios.ts` — extend `ScenarioTrack` with `"korean"`, add 4 scenarios.
- `src/data/certifications.ts` — add `korean: [TOPIK I, TOPIK II]` with official links/prices.
- `src/data/animations.ts` — no schema change; existing English-keyed emoji map already covers Korean vocab because translations are in English.

### Track plumbing (add `"korean"` to unions + switches)
- `src/lib/voice-prefs.ts` — add `korean` default (`ko-KR`, rate 0.95).
- `src/lib/conversation.functions.ts` — extend `TrackEnum` + `personaFor` with a Korean persona (Hangul + romanization).
- `src/lib/review.functions.ts` — add Korean prompt branch.
- `src/lib/speaking.functions.ts` — add Korean recognition locale + prompt branch.
- `src/routes/api/chat.ts` (or the handler it delegates to in `src/lib/http-handlers.server.ts`) — add Korean tutor persona.
- `src/hooks/useLanguageGate.ts` — include Korean in allowed set.
- `src/components/VoicePreferences.tsx` — render Korean row.

### UI surfaces
- `src/routes/_authenticated/onboarding.tsx` — Korean option (🇰🇷).
- `src/routes/_authenticated/dashboard.tsx`, `learn/index.tsx`, `vocabulary.tsx`, `conversations/index.tsx`, `certifications.tsx` — add Korean label/flag entries in local `TRACK_LABEL` maps.
- `src/routes/_authenticated/learn/$lessonId.tsx` — mark Korean Hangul/number lessons as `isSymbolFoundation` so they use the tap-to-hear grid (already generic — driven by lesson id pattern).
- `src/routes/index.tsx` — hero copy ("English, French, German, Japanese & Korean"), footer language list, add 🇰🇷 card.
- `src/routes/about.tsx`, `blog.master-lingo-vs-duolingo-vs-babbel.tsx` — mention Korean where languages are listed.
- `src/lib/http-handlers.server.ts` — no sitemap change needed (no per-language routes), but update any JSON-LD `inLanguage`/`availableLanguage` arrays.
- `src/styles.css` — add a `--korean` accent color token (matching pattern of `--french`, `--german`, `--japanese`).

### Visuals to make it fun
- Hangul grid tiles reuse the existing animated highlight + pulsing speaker used for Japanese kana.
- Every vocab card shows the `AnimatedIcon` for its English meaning (bouncing 🍚, steaming ☕, waving 👋 for 안녕).
- Category node on the learn path uses `categoryIconFor` (already generic).
- Add a couple of Korean-specific emoji hooks to `src/data/animations.ts` if any new meanings appear (e.g. "kimchi" → 🥬 pulse) — only additive.

## Technical notes

- Enum extension is the only breaking type change; TypeScript will surface every missing `case` in `switch(track)` blocks so we catch all sites during build.
- No DB migration required — `user_onboarding.language` is a free-form text column already storing strings like `"hindi_english"`.
- No new package installs. No payment/entitlement changes (features are currently unlocked for all users).
- TTS falls back gracefully if the browser lacks a `ko-KR` voice; Voice Preferences lets users pick any installed voice.

## Out of scope

- No new blog article for Korean this round (can be added later as a separate SEO task).
- No Korean grammar deep-dives beyond what the tutor generates on demand.
