import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const InputSchema = z.object({
  language: z.enum(["english", "hindi_english"]),
  transcript: z.string().min(1).max(2000),
  prompt: z.string().max(400).optional().default(""),
  level: z.string().max(8).optional().default("A2"),
});

export type SpeakingFeedback = {
  originalTranscript: string;
  correctedTranscript: string;
  corrections: { original: string; corrected: string; explanation: string }[];
  targetLanguageExamples: { text: string; translation: string }[];
  pronunciationTips: string[];
  fluencyScore: number; // 0-100
  encouragement: string;
  followUpPrompt: string;
};

const FeedbackSchema: z.ZodType<SpeakingFeedback> = z.object({
  originalTranscript: z.string(),
  correctedTranscript: z.string(),
  corrections: z.array(
    z.object({
      original: z.string(),
      corrected: z.string(),
      explanation: z.string(),
    })
  ),
  targetLanguageExamples: z.array(
    z.object({ text: z.string(), translation: z.string() })
  ),
  pronunciationTips: z.array(z.string()),
  fluencyScore: z.number().min(0).max(100),
  encouragement: z.string(),
  followUpPrompt: z.string(),
});

export const analyzeSpeaking = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<SpeakingFeedback> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const isHindiTrack = data.language === "hindi_english";
    const explainIn = isHindiTrack
      ? "Hindi in Devanagari script (short, warm, encouraging — Hinglish is fine when it's clearer)"
      : "clear, level-appropriate English";

    const system = `You are a supportive English-speaking coach for Master Lingo.
The learner is practising SPOKEN English at CEFR level ${data.level}.
Their speech was captured by browser speech-to-text, so expect small transcription artefacts — infer intent charitably.

Return STRICT JSON matching this TypeScript type (no markdown, no code fences, no commentary):
{
  "originalTranscript": string,           // echo the learner's transcript verbatim
  "correctedTranscript": string,          // full, natural English rewrite (grammar + word order + articles)
  "corrections": Array<{                  // 2-6 concrete fixes; empty [] if speech was already perfect
    "original": string,                   // the wrong fragment as the learner said it
    "corrected": string,                  // the fixed fragment
    "explanation": string                 // 1 sentence, ${explainIn}
  }>,
  "targetLanguageExamples": Array<{       // 3 model English sentences the learner can copy for THIS scenario
    "text": string,                       // the English sentence
    "translation": string                 // ${isHindiTrack ? "Hindi translation in Devanagari" : "a plain-English paraphrase or definition"}
  }>,
  "pronunciationTips": string[],          // 2-3 short tips (stress, vowel length, silent letters). Written in ${explainIn}.
  "fluencyScore": number,                 // 0-100 overall: grammar + vocabulary + task completion
  "encouragement": string,                // 1-2 warm sentences in ${explainIn}
  "followUpPrompt": string                // ONE English question that pushes them to speak again on the same scenario
}

Rules:
- Always give the CORRECTED English in English, no matter which track.
- If corrections is empty, still fill examples/tips/followUpPrompt with useful practice material.
- Never invent what the learner didn't say — corrections must map to actual fragments of their transcript.
- Keep every string under 240 characters.
`;

    const userMsg = `Scenario / prompt the learner was answering:
${data.prompt?.trim() || "(free speaking practice — no set scenario)"}

Learner's spoken transcript:
"""
${data.transcript.trim()}
"""

Return only the JSON object.`;

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-2.5-flash");

    const { text } = await generateText({
      model,
      system,
      prompt: userMsg,
    });

    // Strip accidental code fences and parse.
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      // Fall back: extract the first {...} block.
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Coach returned an unreadable response — please try again.");
      parsed = JSON.parse(match[0]);
    }
    const result = FeedbackSchema.safeParse(parsed);
    if (!result.success) {
      throw new Error("Coach response did not match the expected format.");
    }
    return result.data;
  });
