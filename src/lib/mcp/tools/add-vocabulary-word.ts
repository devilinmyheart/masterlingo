import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase-user";

export default defineTool({
  name: "add_vocabulary_word",
  title: "Add vocabulary word",
  description:
    "Save a new word into the signed-in learner's LingoMaster vocabulary notebook.",
  inputSchema: {
    language: z.enum(["french", "german", "japanese"]).describe("Target language."),
    word: z.string().trim().min(1).describe("The word or phrase in the target language."),
    translation: z.string().trim().min(1).describe("English translation."),
    pronunciation: z.string().trim().optional().describe("Optional pronunciation hint."),
    example: z.string().trim().optional().describe("Optional example sentence."),
    favorite: z.boolean().optional().describe("Mark as favorite."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const { data, error } = await supabaseForUser(ctx)
      .from("vocabulary_items")
      .insert({
        user_id: ctx.getUserId(),
        language: input.language,
        word: input.word,
        translation: input.translation,
        pronunciation: input.pronunciation ?? null,
        example: input.example ?? null,
        favorite: input.favorite ?? false,
      })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved "${input.word}" (${input.language}).` }],
      structuredContent: { item: data },
    };
  },
});
