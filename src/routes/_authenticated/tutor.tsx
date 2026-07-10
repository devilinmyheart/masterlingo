import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { CURRICULUM, LANGUAGE_LIST } from "@/data/curriculum";
import type { LanguageId } from "@/data/curriculum";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/tutor")({
  head: () => ({
    meta: [
      { title: "AI Tutor — LingoMaster" },
      { name: "description", content: "Chat live with an always-on AI language tutor for grammar help, translations, and speaking practice." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/tutor" }],
  }),
  component: TutorPage,
});

const SUGGESTIONS: Record<LanguageId, string[]> = {
  french: ["Explain the difference between être and avoir", "Correct: J'ai allé au parc hier", "Give me 5 useful travel phrases"],
  german: ["When do I use der/die/das?", "Explain German cases with examples", "Roleplay ordering coffee in Berlin"],
  japanese: ["Difference between は and が?", "Teach me polite request forms", "5 phrases for a Tokyo restaurant"],
  english: ["Explain present perfect vs past simple", "Fix: I have went to school", "Give me 5 useful business email phrases"],
  hindi_english: ["Present perfect का हिन्दी में क्या मतलब है?", "Correct: I am going to home", "रोज़मर्रा की 5 English phrases सिखाइए"],
};

function TutorPage() {
  const [language, setLanguage] = useState<LanguageId>("french");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    supabase.from("user_onboarding").select("language").maybeSingle().then(({ data }) => {
      if (data?.language) setLanguage(data.language as LanguageId);
    });
  }, []);

  const transport = new DefaultChatTransport({
    api: "/api/chat",
    body: { language },
    fetch: async (input, init) => {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      const headers = new Headers(init?.headers);
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    },
  });
  const { messages, sendMessage, status } = useChat({ id: language, transport });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [status]);

  const busy = status === "submitted" || status === "streaming";
  const course = CURRICULUM[language];

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!text.trim() || busy) return;
    sendMessage({ text: text.trim() });
    setText("");
  }

  function sendPrompt(p: string) {
    if (busy) return;
    sendMessage({ text: p });
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col md:h-screen">
      {/* Header */}
      <div className="border-b border-border bg-background/70 px-4 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-tr from-brand to-french text-white shadow-lg">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">AI Tutor</h1>
              <p className="text-xs text-muted-foreground">Ask about grammar, culture, or practice conversation</p>
            </div>
          </div>
          <div className="flex gap-1 rounded-full border border-border bg-background p-1">
            {LANGUAGE_LIST.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                  language === l.id ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span>{l.flag}</span> {l.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-soft text-brand">
                <Sparkles className="size-7" />
              </div>
              <h2 className="mt-6 font-display text-3xl font-bold">
                What would you like to learn about <span className="text-brand">{course.nativeName}</span>?
              </h2>
              <p className="mt-2 text-muted-foreground">Try one of these to get started:</p>
              <div className="mx-auto mt-6 grid max-w-2xl gap-2 sm:grid-cols-3">
                {SUGGESTIONS[language].map((s) => (
                  <button
                    key={s}
                    onClick={() => sendPrompt(s)}
                    className="glass-panel rounded-2xl p-4 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {messages.map((m) => {
            const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
            const isUser = m.role === "user";
            return (
              <div key={m.id} className={cn("flex gap-3", isUser && "flex-row-reverse")}>
                <div className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-full text-xs font-bold",
                  isUser ? "bg-foreground text-background" : "bg-brand-soft text-brand"
                )}>
                  {isUser ? "You" : <Sparkles className="size-4" />}
                </div>
                <div className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  isUser ? "rounded-tr-none bg-brand text-brand-foreground" : "rounded-tl-none bg-card"
                )}>
                  {isUser ? text : (
                    <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1 prose-ul:my-2 prose-strong:text-foreground">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {status === "submitted" && (
            <div className="flex gap-3">
              <div className="grid size-9 place-items-center rounded-full bg-brand-soft text-brand"><Sparkles className="size-4" /></div>
              <div className="rounded-2xl rounded-tl-none bg-card px-4 py-3 text-sm text-muted-foreground">
                <span className="inline-flex gap-1">
                  <span className="size-2 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="size-2 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-3xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
            }}
            placeholder={`Ask something about ${course.nativeName}…`}
            rows={1}
            className="min-h-[48px] max-h-32 flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/40"
          />
          <Button type="submit" disabled={busy || !text.trim()} size="icon" className="size-12 shrink-0 rounded-2xl bg-brand text-brand-foreground hover:bg-brand/90">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
