import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { assertPro } from "@/lib/entitlement";

const TrackEnum = z.enum(["french", "german", "japanese", "english", "hindi_english"]);

const TurnInput = z.object({
  track: TrackEnum,
  scenario: z.object({
    title: z.string(),
    role: z.string(),
    setting: z.string(),
    goal: z.string(),
  }),
  history: z.array(
    z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })
  ).max(30),
  userMessage: z.string().min(1).max(1000),
});

export type Correction = { original: string; corrected: string; explanation: string };
export type TurnReply = {
  reply: string; // AI's next line in target language
  translation: string; // meta-language gloss of the reply
  corrections: Correction[]; // corrections on the learner's message (may be empty)
  hint: string; // one short suggestion the learner could say next
};

const TurnReplySchema: z.ZodType<TurnReply> = z.object({
  reply: z.string(),
  translation: z.string(),
  corrections: z.array(
    z.object({ original: z.string(), corrected: z.string(), explanation: z.string() })
  ),
  hint: z.string(),
});

function personaFor(track: z.infer<typeof TrackEnum>) {
  switch (track) {
    case "french":
      return { target: "French", explainIn: "English", scriptNote: "" };
    case "german":
      return { target: "German", explainIn: "English", scriptNote: "" };
    case "japanese":
      return {
        target: "Japanese",
        explainIn: "English",
        scriptNote:
          "Always show Japanese in kanji + kana, followed by romaji in parentheses.",
      };
    case "english":
      return { target: "English", explainIn: "English", scriptNote: "" };
    case "hindi_english":
      return {
        target: "English",
        explainIn: "Hindi (Devanagari; Hinglish is fine when clearer)",
        scriptNote: "The learner is a Hindi speaker practising English.",
      };
  }
}

async function callJson<T>(system: string, prompt: string, schema: z.ZodType<T>): Promise<T> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gateway = createLovableAiGatewayProvider(key);
  const model = gateway("google/gemini-2.5-flash");
  const { text } = await generateText({ model, system, prompt });
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("Tutor returned an unreadable response — please try again.");
    parsed = JSON.parse(match[0]);
  }
  const result = schema.safeParse(parsed);
  if (!result.success) throw new Error("Tutor response did not match the expected format.");
  return result.data;
}

export const conversationTurn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => TurnInput.parse(input))
  .handler(async ({ data, context }): Promise<TurnReply> => {
    await assertPro(context.supabase, context.userId);
    const p = personaFor(data.track);
    const system = `You are roleplaying with a Master Lingo learner practising SPOKEN ${p.target}.
Your character: ${data.scenario.role}.
Scenario: ${data.scenario.title} — ${data.scenario.setting}
The learner's goal in this scene: ${data.scenario.goal}
${p.scriptNote}

For EVERY turn, return STRICT JSON (no code fences, no commentary) matching:
{
  "reply": string,          // your next line, IN CHARACTER, in ${p.target}. 1-3 short sentences. Keep the conversation moving; ask a natural follow-up question when it fits.
  "translation": string,    // the same line in ${p.explainIn} so the learner can understand.
  "corrections": Array<{    // gentle corrections on the LEARNER'S last message. Empty [] if it was already natural.
    "original": string,     // the wrong fragment as the learner wrote it
    "corrected": string,    // the natural ${p.target} version
    "explanation": string   // ONE short sentence in ${p.explainIn}
  }>,
  "hint": string             // ONE short suggestion in ${p.explainIn}: what the learner could say next.
}

Rules:
- Stay in character. Do NOT break the fourth wall unless the learner asks for help.
- Never invent corrections — only fix what the learner actually said.
- Keep every string under 240 characters.`;

    const historyText = data.history
      .map((m) => `${m.role === "user" ? "Learner" : "You"}: ${m.content}`)
      .join("\n");
    const userPrompt = `Conversation so far:
${historyText || "(no messages yet — this is the learner's first reply)"}

Learner just said:
"""
${data.userMessage.trim()}
"""

Return only the JSON object.`;

    return callJson(system, userPrompt, TurnReplySchema);
  });

// ------------------ Summary ------------------

const SummaryInput = z.object({
  track: TrackEnum,
  scenario: z.object({
    title: z.string(),
    role: z.string(),
    setting: z.string(),
    goal: z.string(),
  }),
  history: z.array(
    z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })
  ).min(1).max(60),
});

export type ConversationSummary = {
  fluencyScore: number; // 0-100
  strengths: string[];
  improvements: string[];
  newVocabulary: { word: string; meaning: string }[];
  encouragement: string;
  nextScenarioIdea: string;
};

const SummarySchema: z.ZodType<ConversationSummary> = z.object({
  fluencyScore: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  newVocabulary: z.array(z.object({ word: z.string(), meaning: z.string() })),
  encouragement: z.string(),
  nextScenarioIdea: z.string(),
});

export const summarizeConversation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SummaryInput.parse(input))
  .handler(async ({ data, context }): Promise<ConversationSummary> => {
    await assertPro(context.supabase, context.userId);
    const p = personaFor(data.track);
    const system = `You are a Master Lingo coach reviewing a spoken roleplay in ${p.target}.
Scenario: ${data.scenario.title} — ${data.scenario.setting}. Learner goal: ${data.scenario.goal}.

Return STRICT JSON matching:
{
  "fluencyScore": number,          // 0-100 overall: grammar + vocab + task completion + naturalness
  "strengths": string[],           // 2-4 concrete things they did well, in ${p.explainIn}
  "improvements": string[],        // 2-4 concrete things to work on, in ${p.explainIn}
  "newVocabulary": Array<{         // 3-6 useful ${p.target} words/phrases from the conversation
    "word": string,                // the ${p.target} word or phrase
    "meaning": string              // meaning in ${p.explainIn}
  }>,
  "encouragement": string,         // 1-2 warm sentences in ${p.explainIn}
  "nextScenarioIdea": string       // ONE next roleplay idea to try, in ${p.explainIn}
}

No markdown, no commentary. Keep every string under 240 characters.`;

    const transcript = data.history
      .map((m) => `${m.role === "user" ? "Learner" : "Partner"}: ${m.content}`)
      .join("\n");
    const userPrompt = `Full transcript:
${transcript}

Return only the JSON object.`;

    return callJson(system, userPrompt, SummarySchema);
  });
