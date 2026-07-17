## Plan

1. **Change lesson progression from “teach then quiz every card” to “teach all cards first, then final quiz”**
   - Replace the current per-card button text `Got it — quiz me` with `Next`.
   - During normal lessons, tapping `Next` will move through the teaching cards only.
   - Only after the last teaching card will the lesson enter quiz mode.
   - Keep review/checkpoint lessons as quiz-only because those are already the final quiz modules.

2. **Show the full alphabet in alphabet lessons**
   - Update the foundation alphabet decks so alphabet lessons use the full available alphabet list instead of only 6 cards.
   - Expand the currently shortened alphabet data where needed, especially French/English/Hindi-for-English, so learners see the full alphabet rather than A–L only.
   - Keep number lessons compact unless you want those expanded separately.

3. **Adjust quiz behavior to happen at the end of the module**
   - After all teaching cards are complete, show the quiz cards for the same module.
   - Quiz answers will remain multiple choice, but users will no longer be forced into selection after each individual learning card.
   - Update progress calculations so the bar reflects learning first, then quiz completion.

4. **Clean up learner-facing wording**
   - Remove copy that says “we’ll check your recall” on every teaching card.
   - Use neutral learning copy such as “Listen, repeat, and continue when ready.”
   - Make foundation alphabet cards say “Say it” / “As in …” without implying the letter has an English meaning.

5. **Review plan after implementation**
   - Open an alphabet lesson and confirm the first action says `Next`, not `Got it — quiz me`.
   - Confirm the lesson teaches through all alphabet entries before any quiz appears.
   - Confirm the final quiz still works and completion saving is unchanged.