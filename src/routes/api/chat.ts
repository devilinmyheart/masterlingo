import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

type Body = { messages?: unknown; language?: string };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, language } = (await request.json()) as Body;
        if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const langName = language === "german" ? "German" : language === "japanese" ? "Japanese" : "French";
        const system = `You are a friendly, patient LingoMaster AI tutor helping the learner master ${langName}.
- Answer in clear English by default, but include ${langName} examples with translations.
- When the user asks about grammar, explain the rule concisely, then give 2-3 examples.
- When the user writes in ${langName}, gently correct mistakes and show the improved version.
- Use markdown for structure (headings, bold, lists). Keep replies focused and under ~250 words.
- Encourage the learner and offer a short follow-up practice at the end.`;

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
