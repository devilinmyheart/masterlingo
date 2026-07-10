import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listVocabulary from "./tools/list-vocabulary";
import addVocabularyWord from "./tools/add-vocabulary-word";
import getLearningProgress from "./tools/get-learning-progress";

// OAuth issuer MUST be the direct Supabase host (not the .lovable.cloud proxy).
const projectRef =
  import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "lingomaster-mcp",
  title: "Master Lingo MCP",
  version: "0.1.0",
  instructions:
    "Tools for a Master Lingo learner. Read the learner's vocabulary notebook and progress across French, German, and Japanese, and add new vocabulary words. All actions run as the signed-in user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listVocabulary, addVocabularyWord, getLearningProgress],
});
