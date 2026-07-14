## Goal
Restructure the Learn experience so beginners start from true basics (alphabet → words → phrases → sentences), and remove the pronunciation/mic "speak" step that appears after every quiz card.

## Changes

### 1. Remove the post-quiz speaking step (every lesson)
File: `src/routes/_authenticated/learn/$lessonId.tsx`
- Drop the `"speak"` phase entirely from the lesson state machine — after the quiz answer, the "Next word" button advances directly to the next card.
- Delete the `SpeakStep` component, `sttLangFor`, `similarity`, `normalize` helpers, and mic-related UI/icons from this file.
- Keep the existing 🔊 audio button on the learn card (that's passive listening, not the mic step the user dislikes).
- Speaking practice remains available as its own dedicated page at `/speaking` for users who want it.

### 2. Restructure curriculum into a real beginner-first progression
File: `src/data/curriculum.ts`
Reorganize each language's A1 level so lessons follow this order:

```text
1. Alphabet & sounds            (letters, pronunciation)
2. Numbers 1–20
3. Greetings & polite phrases
4. Basic words (colors, family, food)
5. Simple sentences (I am…, I have…, This is…)
6. Everyday questions (What is…?, Where is…?)
7. A1 Review Quiz               (final checkpoint)
```
A2–C2 keep their current topics but each level ends with a "Level Review Quiz" node.

### 3. Add alphabet / foundations content
File: `src/data/vocabulary.ts`
Add a new `FOUNDATIONS` dataset per language containing:
- Alphabet entries (letter → name/sound, e.g. `A → "ay"`, `あ → "a"`, `अ → "a"`)
- Numbers 1–20
- Core greetings

The lesson deck builder in `$lessonId.tsx` picks from the foundations set when the lesson id is an alphabet/numbers/greetings lesson, and from the existing `STARTER_VOCAB` otherwise.

### 4. Quiz-only "checkpoint" lessons
For the review-quiz lessons at the end of each level, the lesson skips the "learn" phase and goes straight into multiple-choice quiz cards drawn from that level's vocabulary — matching the user's ask that the quiz comes "at last" after completing the section.

## Out of scope
- No changes to `/speaking`, `/review`, `/tutor`, dashboard, or auth.
- No DB migrations — this is content + lesson-flow only.
- Voice preferences UI stays (used for passive audio playback of words).
