import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { createClient } from "@supabase/supabase-js";

type Body = { messages?: unknown; language?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        // Require an authenticated Supabase user before consuming AI credits.
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (!token || token.split(".").length !== 3) {
          return new Response("Unauthorized", { status: 401 });
        }
        const SUPABASE_URL = process.env.SUPABASE_URL;
        const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
          return new Response("Server auth not configured", { status: 500 });
        }
        const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });
        const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
        if (claimsError || !claimsData?.claims?.sub) {
          return new Response("Unauthorized", { status: 401 });
        }

        const { messages, language } = (await request.json()) as Body;
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });


        // Language-aware tutor persona. `explainIn` is the metalanguage used for
        // grammar/vocab explanations; `targetLang` is what the learner is practising.
        const profile =
          language === "german"
            ? { targetLang: "German", explainIn: "English", scriptNote: "" }
            : language === "japanese"
              ? { targetLang: "Japanese", explainIn: "English", scriptNote: "Always show Japanese in kanji + kana, followed by romaji in parentheses and an English gloss." }
              : language === "english"
                ? { targetLang: "English", explainIn: "English", scriptNote: "The learner is studying English, so respond fully in English at a level appropriate to their CEFR band. Do NOT translate into another language unless the learner explicitly asks." }
                : language === "hindi_english"
                  ? { targetLang: "English", explainIn: "Hindi (Devanagari script, with the occasional Hinglish word where it's clearer)", scriptNote: "The learner is a Hindi speaker learning English. Give English example sentences first, then explain the grammar/meaning in Hindi. Use Devanagari for Hindi (नमस्ते, क्रिया, काल). Keep English simple and grade it to their level." }
                  : { targetLang: "French", explainIn: "English", scriptNote: "" };

        const system = `You are a friendly, patient Master Lingo AI tutor helping the learner master ${profile.targetLang}.
- Write your explanations in ${profile.explainIn}. Always include ${profile.targetLang} example sentences with a short translation.
- ${profile.scriptNote}
- When the user asks about grammar, state the rule concisely, then give 2-3 ${profile.targetLang} examples with translations.
- When the user writes in ${profile.targetLang}, gently correct mistakes and show the improved version with a one-line reason.
- If the user asks for speaking / pronunciation practice, give a short ${profile.targetLang} phrase, a phonetic hint, and a role-play prompt they can reply to.
- Use markdown (headings, bold, lists). Keep replies focused and under ~250 words.
- End with a short follow-up practice question in ${profile.targetLang} to keep the conversation going.`;


        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-2.5-flash");

        const result = streamText({
          model,
          system,
          messages: await convertToModelMessages(messages as UIMessage[]),
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages as UIMessage[] });
      },
    },
  },
});
