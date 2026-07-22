import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-user";

export default defineTool({
  name: "list_vocabulary",
  title: "List vocabulary",
  description:
    "List saved words from the signed-in learner's Master Lingo vocabulary notebook, optionally filtered by language.",
  inputSchema: {
    language: z
      .enum(["french", "german", "japanese", "english", "hindi_english", "korean"])
      .optional()
      .describe("Filter by target language."),
    limit: z
      .number()
      .int()
      .optional()
      .describe("Max items to return (default 50, max 200)."),
    favorites_only: z
      .boolean()
      .optional()
      .describe("Only return favorited words."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ language, limit, favorites_only }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const cap = Math.min(Math.max(limit ?? 50, 1), 200);
    let q = supabaseForUser(ctx)
      .from("vocabulary_items")
      .select("id, language, word, translation, pronunciation, example, favorite, mastery, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(cap);
    if (language) q = q.eq("language", language);
    if (favorites_only) q = q.eq("favorite", true);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [] },
    };
  },
});
