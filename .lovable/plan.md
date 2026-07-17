# Show the full alphabet on a single page

Right now the Alphabet (and Numbers) foundation lessons walk the learner through one symbol at a time with a "Next" button, then run a quiz. You want the whole set visible on one page so learners can browse it at once.

## What changes

Only the Alphabet / Numbers foundation lessons in `src/routes/_authenticated/learn/$lessonId.tsx`. Vocabulary lessons (French words, greetings, etc.) keep the current one-card teaching flow — they're not alphabets and one-per-page pacing still fits.

### New "grid" learning phase for foundations

When the lesson is an alphabet or numbers lesson:

- Replace the single-card "learn" screen with a responsive grid showing every letter/number in the deck at once.
- Each tile shows:
  - The big symbol (e.g. `A`, `あ`, `1`)
  - Its spoken name / sound (e.g. "ay", "a", "one")
  - Example word underneath when available (e.g. "as in Apple")
  - A speaker button to hear it
- Tiles are tappable — tapping plays the audio (and briefly highlights the tile) so learners can drill any letter in any order.
- A single "Start quiz" button at the bottom moves to the existing quiz phase, which stays unchanged (multiple-choice for each symbol at the end, as you already asked).

### Progress bar

Update the progress calculation so the learning phase for foundations counts as one step (viewing the grid) rather than N steps (one per card). The quiz portion still fills the rest of the bar as answers come in.

### Everything else stays the same

- Vocabulary lessons: unchanged (teach one word at a time, quiz at the end).
- Greetings foundation: unchanged (uses translation-style cards, not symbol drill).
- Quiz behavior, translate exercise, completion screen, XP saving: unchanged.
- No data changes — the full alphabet is already in `FOUNDATION_CARDS` in `src/data/vocabulary.ts`.

## Technical notes

- In `LessonPage`, branch the `phase === "learn"` render on `current.isFoundation` (or on `foundation === "alphabet" | "numbers"`) to render the grid instead of the single-card layout.
- Keep `buildDeck` as-is; the grid just maps over `cards` rather than indexing by `idx`.
- Adjust the `progress` formula so foundation lessons treat "learn" as 1 unit total; quiz units unchanged.
- Tile grid: `grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3`, each tile a rounded card with symbol, sound, optional example word, and a small `Volume2` button that calls the existing `speak(...)`.