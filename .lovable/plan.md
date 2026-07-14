## The real problem

The current "Alphabet & Pronunciation" lesson treats every card like a vocabulary word: front = letter, back = a fake "translation" like `letter 'bay'`. That's why the screen shows **B → "MEANING IN ENGLISH: letter 'bay'"** and the quiz then asks "what does B mean?" with four near-identical distractors. It's confusing for every language, and outright nonsense for the English track (English letters don't need an English translation).

Same shape breaks numbers lessons and any future foundations.

## Plan

### 1. New data shape for foundations (`src/data/vocabulary.ts`)

Replace the `Word`-style rows in `FOUNDATIONS` with a purpose-built shape:

```
type FoundationCard = {
  symbol: string;        // "B", "5", "こ"
  name: string;          // "bay" (French), "bee" (English), "ko"
  sound: string;         // IPA-ish pronunciation for TTS
  exampleWord?: string;  // "Berthe" / "book"
  exampleGloss?: string; // short English gloss when target ≠ English
};
```

Rewrite alphabet + numbers arrays for french / german / japanese / english / hindi_english using this shape. Drop the misleading "letter 'bay'" strings entirely.

### 2. Foundation-specific lesson UI (`src/routes/_authenticated/learn/$lessonId.tsx`)

Branch `buildDeck` + the render tree on `detectFoundation(lessonId)`:

- **Learn phase** — big letter/number, tap-to-hear button, caption "Say it: **bay**", optional example word ("as in Berthe"). No fake "meaning in English" box.
- **Quiz phase** — two rotating formats for variety:
  - "Which letter makes this sound?" → play audio, pick from 4 letter tiles.
  - "How do you pronounce this letter?" → show letter, pick from 4 sound names.
  For the English alphabet track, only use the second format (letter → name).
- Distractors come from other foundation cards in the same deck, not from generic vocab.
- Keep existing progress, XP, completion save, and finish screen untouched.

### 3. Greetings stays as-is

Greetings are real phrases with real translations, so they keep the existing `Word` flow. Only alphabet + numbers get the new shape.

### 4. Guardrails

- Keep the same `Card`/phase state machine so translate + review checkpoints keep working for non-foundation lessons.
- No changes to curriculum, DB, subscription, or router.

## Technical notes

- `FoundationKind` stays `"alphabet" | "numbers" | "greetings"`; `FOUNDATIONS[lang].greetings` remains `Word[]`, `alphabet`/`numbers` become `FoundationCard[]`. Update the type union and the `buildDeck` branch accordingly.
- TTS: reuse existing `speakWithSlot` / `speechSynthesis` path; for "play sound" quiz, autoplay on mount of each question.
- No new packages, no schema changes.

## How to verify

1. Open `/learn/en-a1-alphabet` (English) → letter B card shows "Say it: bee, as in book", no "meaning in English" panel; quiz shows letter → pick pronunciation.
2. Open `/learn/fr-a1-alphabet` (French) → same layout in French; quiz alternates audio→letter and letter→sound.
3. Open a numbers foundation lesson → same treatment with digits.
4. Open a regular vocab lesson (e.g. `fr-a1-greetings` or any A1 topic) → unchanged teach → quiz → optional translate flow.
