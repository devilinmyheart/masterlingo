import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createTanStackInvokeToolHandler, createTanStackListToolsHandler, createTanStackMcpHandler, createTanStackOAuthProtectedResourceMetadataHandler } from "@lovable.dev/mcp-js/stacks/tanstack";
import { CURRICULUM } from "@/data/curriculum";
import type { Database } from "@/integrations/supabase/types";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import mcp from "@/lib/mcp/index";
import { EventName, verifyWebhook, type PaddleEnv } from "@/lib/paddle.server";

type ChatBody = { messages?: unknown; language?: string };

interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const BASE_URL = "https://masterlingo.lovable.app";
const MCP_OPTIONS = {
  resourcePath: "/mcp",
  metadataPath: "/.well-known/oauth-protected-resource",
  trustForwardedHost: true,
};

const mcpHandler = createTanStackMcpHandler(mcp, MCP_OPTIONS);
const listToolsHandler = createTanStackListToolsHandler(mcp, MCP_OPTIONS);
const invokeToolHandler = createTanStackInvokeToolHandler(mcp, MCP_OPTIONS);
const oauthMetadataHandler = createTanStackOAuthProtectedResourceMetadataHandler(mcp, MCP_OPTIONS);

let _supabase: SupabaseClient<Database> | null = null;

function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

export async function handleRawRouteRequest(request: Request): Promise<Response | undefined> {
  const url = new URL(request.url);
  const { pathname } = url;

  if (pathname === "/sitemap.xml") {
    if (request.method !== "GET" && request.method !== "HEAD") return methodNotAllowed("GET, HEAD");
    return handleSitemapRequest();
  }

  if (pathname === "/api/chat") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    return handleChatRequest(request);
  }

  if (pathname === "/api/public/payments/webhook") {
    if (request.method !== "POST") return methodNotAllowed("POST");
    return handlePaymentsWebhookRequest(request);
  }

  if (pathname === "/mcp") {
    return mcpHandler({ request });
  }

  if (pathname === "/.mcp/list-tools") {
    return listToolsHandler({ request });
  }

  if (pathname.startsWith("/.mcp/invoke-tool/")) {
    const tool = decodeURIComponent(pathname.slice("/.mcp/invoke-tool/".length));
    if (!tool) return new Response("Not found", { status: 404 });
    return invokeToolHandler({ request, params: { tool } });
  }

  if (pathname === "/.well-known/oauth-protected-resource") {
    return oauthMetadataHandler({ request });
  }

  return undefined;
}

function methodNotAllowed(allow: string) {
  return new Response("Method not allowed", {
    status: 405,
    headers: { Allow: allow },
  });
}

function handleSitemapRequest() {
  const entries: SitemapEntry[] = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/about", changefreq: "monthly", priority: "0.7" },
    { path: "/auth", changefreq: "monthly", priority: "0.5" },
    { path: "/reset-password", changefreq: "monthly", priority: "0.5" },
    { path: "/dashboard", changefreq: "daily", priority: "0.8" },
    { path: "/onboarding", changefreq: "monthly", priority: "0.5" },
    { path: "/profile", changefreq: "monthly", priority: "0.6" },
    { path: "/tutor", changefreq: "weekly", priority: "0.7" },
    { path: "/vocabulary", changefreq: "weekly", priority: "0.7" },
    { path: "/learn", changefreq: "weekly", priority: "0.9" },
    { path: "/certifications", changefreq: "weekly", priority: "0.7" },
    { path: "/help", changefreq: "monthly", priority: "0.6" },
    { path: "/feedback", changefreq: "monthly", priority: "0.5" },
    { path: "/review", changefreq: "weekly", priority: "0.7" },
    { path: "/speaking", changefreq: "weekly", priority: "0.7" },
    { path: "/conversations", changefreq: "weekly", priority: "0.7" },
    { path: "/blog/master-lingo-vs-duolingo-vs-babbel", changefreq: "monthly", priority: "0.8" },
    { path: "/legal/terms", changefreq: "yearly", priority: "0.4" },
    { path: "/legal/privacy", changefreq: "yearly", priority: "0.4" },
    { path: "/legal/refund", changefreq: "yearly", priority: "0.4" },
  ];

  for (const course of Object.values(CURRICULUM)) {
    for (const level of course.levels) {
      for (const topic of level.topics) {
        entries.push({
          path: `/learn/${topic.id}`,
          changefreq: "monthly",
          priority: "0.6",
        });
      }
    }
  }

  const urls = entries.map(
    (entry) =>
      `  <url>\n    <loc>${BASE_URL}${entry.path}</loc>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority}</priority>\n  </url>`,
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

async function handleChatRequest(request: Request) {
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

  const userId = claimsData.claims.sub as string;
  const supabaseAsUser = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { userHasPro } = await import("@/lib/entitlement");
  if (!(await userHasPro(supabaseAsUser, userId))) {
    return new Response("Pro subscription required", { status: 402 });
  }

  const { messages, language } = (await request.json()) as ChatBody;
  if (!Array.isArray(messages)) return new Response("Messages required", { status: 400 });

  const key = process.env.LOVABLE_API_KEY;
  if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

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
}

async function handleSubscriptionCreated(data: any, env: PaddleEnv) {
  const { id, customerId, items, status, currentBillingPeriod, customData, scheduledChange } = data;
  const userId = customData?.userId;
  if (!userId) {
    console.error("payments-webhook: no userId in customData");
    return;
  }

  const item = items[0];
  const priceId = item.price.importMeta?.externalId;
  const productId = item.product.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn("payments-webhook: missing importMeta.externalId", {
      rawPriceId: item.price.id,
      rawProductId: item.product.id,
    });
    return;
  }

  await getSupabase().from("subscriptions").upsert(
    {
      user_id: userId,
      paddle_subscription_id: id,
      paddle_customer_id: customerId,
      product_id: productId,
      price_id: priceId,
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === "cancel",
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paddle_subscription_id" },
  );
}

async function handleSubscriptionUpdated(data: any, env: PaddleEnv) {
  const { id, status, currentBillingPeriod, scheduledChange } = data;
  await getSupabase()
    .from("subscriptions")
    .update({
      status,
      current_period_start: currentBillingPeriod?.startsAt,
      current_period_end: currentBillingPeriod?.endsAt,
      cancel_at_period_end: scheduledChange?.action === "cancel",
      updated_at: new Date().toISOString(),
    })
    .eq("paddle_subscription_id", id)
    .eq("environment", env);
}

async function handleSubscriptionCanceled(data: any, env: PaddleEnv) {
  await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("paddle_subscription_id", data.id)
    .eq("environment", env);
}

async function handlePaymentsWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);
  switch (event.eventType) {
    case EventName.SubscriptionCreated:
      await handleSubscriptionCreated(event.data, env);
      break;
    case EventName.SubscriptionUpdated:
      await handleSubscriptionUpdated(event.data, env);
      break;
    case EventName.SubscriptionCanceled:
      await handleSubscriptionCanceled(event.data, env);
      break;
    default:
      console.log("payments-webhook: unhandled event", event.eventType);
  }
}

async function handlePaymentsWebhookRequest(request: Request) {
  const url = new URL(request.url);
  const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
  try {
    await handlePaymentsWebhook(request, env);
    return Response.json({ received: true });
  } catch (error) {
    console.error("payments-webhook error:", error);
    return new Response("Webhook error", { status: 400 });
  }
}