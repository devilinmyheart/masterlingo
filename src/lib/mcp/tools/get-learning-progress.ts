import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-user";

export default defineTool({
  name: "get_learning_progress",
  title: "Get learning progress",
  description:
    "Return the signed-in learner's Master Lingo progress: XP, streak, words learned, minutes studied, and per-language stats.",
  inputSchema: {
    language: z
      .enum(["french", "german", "japanese", "english", "hindi_english"])
      .optional()
      .describe("Filter to a single language; omit for all languages."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ language }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const sb = supabaseForUser(ctx);
    let q = sb
      .from("user_progress")
      .select("language, xp, streak_days, words_learned, minutes_studied, last_activity")
      .eq("user_id", ctx.getUserId());
    if (language) q = q.eq("language", language);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { progress: data ?? [] },
    };
  },
});
