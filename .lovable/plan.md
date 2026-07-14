# Conversation Practice

Add a new "Conversations" feature where users have real-time, roleplay dialogues with the AI tutor to practice speaking in their target language.

## User flow

1. From the sidebar, user opens **Conversations**.
2. Picks a scenario card matched to their level (A1–C2), e.g.
   - Ordering coffee in a café
   - Introducing yourself
   - Asking for directions
   - Job interview
   - Debate / opinion exchange (B2+)
3. Enters a chat screen where:
   - AI plays a role (barista, interviewer, local, etc.) and speaks the first line.
   - User **speaks** their reply via mic (Web Speech API) — transcript auto-fills. They can also type as fallback.
   - AI replies in target language + plays TTS audio (using existing `voice-prefs.ts`).
   - After each user turn, AI provides gentle inline corrections (grammar, vocab, natural phrasing) in the user's native language, collapsed by default so it doesn't break immersion.
4. **End conversation** button → AI generates a summary report: fluency score, top 3 corrections, new vocab used, suggested next scenario. User earns XP.

## Scope

**New files**
- `src/data/scenarios.ts` — scenario catalog per language + level (id, title, role, setting, opening line, goals, level).
- `src/routes/_authenticated/conversations/index.tsx` — scenario picker (filtered by user's active language/level).
- `src/routes/_authenticated/conversations/$scenarioId.tsx` — chat interface with mic, TTS, corrections toggle, end-session button.
- `src/lib/conversation.functions.ts` — `createServerFn` handlers:
  - `chatTurn` — streams AI reply + structured corrections given scenario context + history.
  - `summarizeConversation` — returns fluency score, corrections, vocab, next-step suggestion.

**Modified files**
- `src/components/AppSidebar.tsx` — add "Conversations" nav item (MessageCircle icon).
- `src/routes/sitemap[.]xml.ts` — add `/conversations`.
- Existing `speaking.tsx` stays for single-utterance drills; conversations are the multi-turn extension.

**Backend**
- Reuse existing `ai_conversations` + `ai_messages` tables (already present) — add a `scenario_id` column via migration to tag conversation-practice sessions and filter them from tutor history.

## Technical details

- Model: `google/gemini-3-flash-preview` via Lovable AI gateway (streaming via existing `/api/chat` pattern or new server fn — use `streamText` + `toUIMessageStreamResponse` for streamed reply, then a follow-up structured call for corrections to keep the schema simple).
- System prompt is dynamically built per scenario + user track (English/Hindi-for-English uses Hindi meta-explanations, French/German/Japanese use English meta-explanations) — reuses the persona logic already in `src/routes/api/chat.ts`.
- Speech recognition: Web Speech API with language code derived from track (`fr-FR`, `de-DE`, `ja-JP`, `en-US`, `en-IN`).
- TTS: existing `src/lib/voice-prefs.ts`.
- XP: +25 per completed conversation, written via existing `user_progress` update pattern.

## Out of scope (this iteration)

- Realtime voice-to-voice (would need OpenAI Realtime API) — text+TTS is enough to ship first.
- Leaderboards, multiplayer conversations.
- Custom user-authored scenarios.
