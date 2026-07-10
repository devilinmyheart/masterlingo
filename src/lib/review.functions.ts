import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

/**
 * Word Review + Grammar Review flows. Both return structured JSON with
 * language-aware prompts. `language` is the target language the learner
 * is studying; explanations are rendered in the appropriate metalanguage
 * (English by default, Hindi in Devanagari for the hindi_english track,
 * and English for the english track since that IS the target).
 */

const LANGS = ["french", "german", "japanese", "english", "hindi_english"] as const;
const LanguageEnum = z.enum(LANGS);
type Lang = z.infer<typeof LanguageEnum>;

type LangProfile = {
  targetLang: string;
  explainIn: string;
  scriptNote: string;
  translationLabel: string;
};

function languageProfile(language: Lang): LangProfile {
  switch (language) {
    case "german":
      return {
        targetLang: "German",
        explainIn: "clear, level-appropriate English",
        scriptNote: "Include der/die/das articles for nouns and mark separable verb prefixes.",
        translationLabel: "English translation",
      };
    case "japanese":
      return {
        targetLang: "Japanese",
        explainIn: "clear, level-appropriate English",
        scriptNote: "Always show Japanese in kanji + kana first, then romaji in parentheses. If the word has kanji, list the readings and note common compounds.",
        translationLabel: "English translation (romaji in parentheses)",
      };
    case "english":
      return {
        targetLang: "English",
        explainIn: "clear, level-appropriate English (the learner is studying English — do NOT translate into another language unless asked)",
        scriptNote: "For 'translation' fields, give a simple English paraphrase or definition instead of a translation.",
        translationLabel: "Plain-English paraphrase",
      };
    case "hindi_english":
      return {
        targetLang: "English",
        explainIn: "Hindi in Devanagari script (short, warm; Hinglish is fine when it's clearer)",
        scriptNote: "The learner is a Hindi speaker learning English. Give English example sentences first, then explain in Hindi. Use Devanagari (नमस्ते, क्रिया, काल).",
        translationLabel: "Hindi translation in Devanagari",
      };
    case "french":
    default:
      return {
        targetLang: "French",
        explainIn: "clear, level-appropriate English",
        scriptNote: "Mark noun gender (le/la) and show the infinitive for verbs.",
        translationLabel: "English translation",
      };
  }
}

/* ---------------- Word Review ---------------- */

const WordInput = z.object({
  language: LanguageEnum,
  word: z.string().min(1).max(80),
  level: z.string().max(8).optional().default("A2"),
});

export type WordReview = {
  headword: string;
  partOfSpeech: string;
  pronunciation: string;
  meaning: string;
  examples: { text: string; translation: string }[];
  collocations: string[];
  commonMistakes: string[];
  memoryTip: string;
};

const WordSchema: z.ZodType<WordReview> = z.object({
  headword: z.string(),
  partOfSpeech: z.string(),
  pronunciation: z.string(),
  meaning: z.string(),
  examples: z.array(z.object({ text: z.string(), translation: z.string() })),
  collocations: z.array(z.string()),
  commonMistakes: z.array(z.string()),
  memoryTip: z.string(),
});

/* ---------------- Grammar Review ---------------- */

const GrammarInput = z.object({
  language: LanguageEnum,
  topic: z.string().min(1).max(160),
  level: z.string().max(8).optional().default("A2"),
});

export type GrammarReview = {
  title: string;
  summary: string;
  whenToUse: string[];
  rules: { rule: string; example: { text: string; translation: string } }[];
  contrast: string;
  pitfalls: string[];
  quickCheck: { question: string; answer: string };
};

const GrammarSchema: z.ZodType<GrammarReview> = z.object({
  title: z.string(),
  summary: z.string(),
  whenToUse: z.array(z.string()),
  rules: z.array(
    z.object({
      rule: z.string(),
      example: z.object({ text: z.string(), translation: z.string() }),
    })
  ),
  contrast: z.string(),
  pitfalls: z.array(z.string()),
  quickCheck: z.object({ question: z.string(), answer: z.string() }),
});

/* ---------------- Shared helpers ---------------- */

function parseJson<T>(text: string, schema: z.ZodType<T>): T {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  let raw: unknown;
  try {
    raw = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("The tutor returned an unreadable response — please try again.");
    raw = JSON.parse(match[0]);
  }
  const result = schema.safeParse(raw);
  if (!result.success) throw new Error("Tutor response did not match the expected format.");
  return result.data;
}

async function callModel(system: string, prompt: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  const gateway = createLovableAiGatewayProvider(key);
  const model = gateway("google/gemini-2.5-flash");
  const { text } = await generateText({ model, system, prompt });
  return text;
}

/* ---------------- Server functions ---------------- */

export const reviewWord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => WordInput.parse(input))
  .handler(async ({ data }): Promise<WordReview> => {
    const p = languageProfile(data.language);
    const system = `You are a LingoMaster word coach helping a CEFR ${data.level} learner master ${p.targetLang} vocabulary.
Write ALL explanation fields in ${p.explainIn}.
${p.scriptNote}

Return STRICT JSON matching this TypeScript type — no markdown, no code fences, no commentary:
{
  "headword": string,               // the ${p.targetLang} word, correctly written in its native script/form
  "partOfSpeech": string,           // e.g. "noun (masculine)", "verb (transitive)"
  "pronunciation": string,          // IPA or a phonetic hint the learner can actually say aloud
  "meaning": string,                // 1-2 sentence definition in ${p.explainIn}
  "examples": Array<{ "text": string, "translation": string }>, // 3 natural ${p.targetLang} sentences that USE the headword; translation field = ${p.translationLabel}
  "collocations": string[],         // 3-5 common phrases/collocations in ${p.targetLang}
  "commonMistakes": string[],       // 2-3 traps learners fall into, written in ${p.explainIn}
  "memoryTip": string               // 1 vivid mnemonic in ${p.explainIn}
}

Rules:
- Every "text" example must actually contain the headword.
- Keep every string under 240 characters.
- Never invent grammar rules; if uncertain, keep the field short and factual.`;

    const promptText = `Word to review: ${data.word}
Learner level: CEFR ${data.level}
Return only the JSON object.`;

    return parseJson(await callModel(system, promptText), WordSchema);
  });

export const reviewGrammar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GrammarInput.parse(input))
  .handler(async ({ data }): Promise<GrammarReview> => {
    const p = languageProfile(data.language);
    const system = `You are a LingoMaster grammar coach helping a CEFR ${data.level} learner master ${p.targetLang}.
Write ALL explanation fields in ${p.explainIn}.
${p.scriptNote}

Return STRICT JSON matching this TypeScript type — no markdown, no code fences, no commentary:
{
  "title": string,                  // a clear name for the grammar point in ${p.explainIn}
  "summary": string,                // 1-2 sentence overview in ${p.explainIn}
  "whenToUse": string[],            // 3-4 bullets describing when this pattern is used, in ${p.explainIn}
  "rules": Array<{                  // 3-5 concrete rules, each with a MODEL ${p.targetLang} example
    "rule": string,                 // the rule stated in ${p.explainIn}
    "example": { "text": string, "translation": string } // ${p.targetLang} sentence + ${p.translationLabel}
  }>,
  "contrast": string,               // 1-3 sentences contrasting this with a similar/confusable pattern, in ${p.explainIn}
  "pitfalls": string[],             // 2-4 common learner mistakes in ${p.explainIn}
  "quickCheck": {                   // ONE mini-exercise the learner can try
    "question": string,             // a fill-in-the-blank or transform prompt in ${p.targetLang}
    "answer": string                // the expected ${p.targetLang} answer, with a 1-line reason in ${p.explainIn}
  }
}

Rules:
- Every example.text must be a real, natural ${p.targetLang} sentence that demonstrates the rule.
- Keep every string under 240 characters.
- Adjust vocabulary and sentence length to CEFR ${data.level}.`;

    const promptText = `Grammar topic to review: ${data.topic}
Learner level: CEFR ${data.level}
Return only the JSON object.`;

    return parseJson(await callModel(system, promptText), GrammarSchema);
  });
