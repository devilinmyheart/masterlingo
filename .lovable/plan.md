## Add a "Translate the sentence" exercise (Duolingo-style word bank)

Introduce a new exercise type inspired by the screenshot: learners hear a short target-language phrase and rebuild its meaning by tapping word tiles from a scrambled bank. This slots into the existing lesson flow between the teach and quiz phases.

### What the user will see

- A `NEW WORD` / `TRANSLATE` chip at the top.
- A character bubble showing the target-language phrase (e.g. `Un thé ?`) with a 🔊 speaker button that plays the phrase using the language's TTS voice.
- Prompt: **"Write this in <native language>"** (English, or Hindi for the Hindi→English track).
- A **word bank**: tappable pill tiles containing the correct words plus 2–3 distractors, shuffled.
- An **answer tray** above the bank where tapped words appear in order; tapping a placed word sends it back to the bank.
- A **Check** button that turns green (correct) or red (try again) with a shake animation and shows the model answer.
- Hearts decrement on a wrong answer, matching the current quiz rules.

### Where it fits in the lesson

Route `src/routes/_authenticated/learn/$lessonId.tsx` currently runs each card through: **learn → quiz** (multiple-choice). Add a third phase **translate** for cards that have a natural short phrase, so the flow becomes:

```text
learn ──▶ quiz (MCQ) ──▶ translate (word bank) ──▶ next card
```

- Foundation decks (alphabet, numbers) and Review Quizzes **skip** the translate phase — single-word cards don't benefit from a word bank.
- If a card lacks phrase data, the translate phase is skipped for that card, so nothing regresses for older content.

### Content model

Extend the vocabulary item in `src/data/vocabulary.ts` with two optional fields:

- `phrase`: the short target-language sentence (e.g. `Un thé ?`, `Ich hätte gern einen Kaffee.`, `お茶をください。`).
- `phraseTranslation`: the answer in the learner's native language, already tokenised for the word bank (e.g. `A tea?`).

Seed this for the common greeting / café / basic-need words across all five tracks (French, German, Japanese, English, Hindi→English). Japanese uses spaces between meaning units for tokenisation. Only the subset of cards that gets phrases will trigger the new exercise.

### Interaction rules

- Word bank shuffles on mount; tiles animate with a small pop-in.
- Tapping a tile: tile flies up into the answer tray; the bank slot becomes empty/greyed.
- Tapping a placed tile: it flies back to its original bank slot.
- Punctuation (`?`, `.`, `!`) is displayed with the previous word, never a separate tile.
- Case-insensitive comparison; trailing punctuation ignored when grading.
- Wrong answer: red shake, reveal the correct sentence under the tray, `-1 heart`, allow one more try before auto-advancing.
- Correct: green flash, `+2 XP` for translation on top of the existing lesson XP, auto-advance after 900 ms.

### New component

Create `src/components/TranslateExercise.tsx`:

- Props: `phrase`, `phraseTranslation`, `voiceSlot`, `onResult(correct: boolean)`.
- Owns tile state, shuffle, tap-to-place / tap-to-remove, grading, and the check button.
- Uses `speakWithSlot` from `src/lib/voice-prefs.ts` for the audio button (same helper used elsewhere).
- Uses Framer Motion for the tile fly / shake / green pulse (already in the project).

### Files touched

| File | Change |
| --- | --- |
| `src/data/vocabulary.ts` | Add optional `phrase` + `phraseTranslation` fields; seed for foundational cards across all tracks. |
| `src/components/TranslateExercise.tsx` | **New** — the word-bank exercise UI. |
| `src/routes/_authenticated/learn/$lessonId.tsx` | Add `translate` phase between `quiz` and next card; render `TranslateExercise` when the current card has phrase data; skip for foundation / review-quiz decks. |

### Out of scope for this plan

- Free-text typing input (word-bank only, matching the screenshot).
- Drag-and-drop reordering (tap-to-place is simpler on mobile and hits the same target).
- Reverse direction (English → target); can be a follow-up if you like it.
