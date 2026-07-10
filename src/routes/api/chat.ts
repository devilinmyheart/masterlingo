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
