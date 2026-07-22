import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mic,
  Square,
  Send,
  Volume2,
  Loader2,
  Flag,
  Sparkles,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { findScenario, type ScenarioTrack } from "@/data/scenarios";
import {
  conversationTurn,
  summarizeConversation,
  type Correction,
  type ConversationSummary,
} from "@/lib/conversation.functions";
import { useVoicePrefs, speakWithSlot, type VoiceSlot } from "@/lib/voice-prefs";

export const Route = createFileRoute("/_authenticated/conversations/$scenarioId")({
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
  component: ConversationRoom,
});

type Turn = {
  role: "user" | "assistant";
  content: string;
  translation?: string;
  corrections?: Correction[];
  hint?: string;
};

// ---- Web Speech typings ----
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult:
    | ((e: {
        resultIndex: number;
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SRCtor = new () => SR;

function getRecognitionCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SRCtor;
    webkitSpeechRecognition?: SRCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const SR_LANG: Record<ScenarioTrack, string> = {
  french: "fr-FR",
  german: "de-DE",
  japanese: "ja-JP",
  english: "en-US",
  hindi_english: "en-IN",
  korean: "ko-KR",
};

function trackVoice(track: ScenarioTrack): VoiceSlot {
  // Fallback default voice slot for languages we don't store prefs for yet.
  return { lang: SR_LANG[track], voiceURI: "", rate: 0.95, pitch: 1 };
}

function ConversationRoom() {
  const { scenarioId } = useParams({ from: "/_authenticated/conversations/$scenarioId" });
  const scenario = findScenario(scenarioId);
  const [prefs] = useVoicePrefs();

  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const recogRef = useRef<SR | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const track = scenario?.track ?? "english";

  const targetVoice = useMemo<VoiceSlot>(() => {
    if (track === "english") return prefs.english;
    if (track === "hindi_english") return prefs.hindi_english.target;
    return trackVoice(track);
  }, [track, prefs]);

  const explainVoice = useMemo<VoiceSlot>(() => {
    if (track === "hindi_english") return prefs.hindi_english.gloss;
    return prefs.english; // English gloss for FR/DE/JA/EN
  }, [track, prefs]);

  // XP bump on complete
  const userQ = useQuery({
    queryKey: ["me-uid-convo"],
    queryFn: async () => (await supabase.auth.getUser()).data.user?.id ?? null,
  });

  // Seed with AI opening line
  useEffect(() => {
    if (!scenario) return;
    setTurns([
      {
        role: "assistant",
        content: scenario.opening,
        translation: scenario.openingTranslation,
      },
    ]);
    setSummary(null);
    // auto-speak the opening
    setTimeout(() => speakWithSlot(scenario.opening, targetVoice), 200);
    setTimeout(() => inputRef.current?.focus(), 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenarioId]);

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
    return () => {
      try {
        recogRef.current?.stop();
      } catch {
        /* noop */
      }
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, summary]);

  const turnFn = useServerFn(conversationTurn);
  const sumFn = useServerFn(summarizeConversation);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!scenario) throw new Error("Scenario not found");
      const history = turns.map((t) => ({ role: t.role, content: t.content }));
      return turnFn({
        data: {
          track: scenario.track,
          scenario: {
            title: scenario.title,
            role: scenario.role,
            setting: scenario.setting,
            goal: scenario.goal,
          },
          history,
          userMessage: text,
        },
      });
    },
    onSuccess: (reply) => {
      setTurns((prev) => {
        // Attach corrections/hint to the last user turn
        const next = [...prev];
        if (next.length && next[next.length - 1].role === "user") {
          next[next.length - 1] = {
            ...next[next.length - 1],
            corrections: reply.corrections,
            hint: reply.hint,
          };
        }
        next.push({
          role: "assistant",
          content: reply.reply,
          translation: reply.translation,
        });
        return next;
      });
      setTimeout(() => speakWithSlot(reply.reply, targetVoice), 100);
      setTimeout(() => inputRef.current?.focus(), 200);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "The partner didn't respond."),
  });

  const summaryMutation = useMutation({
    mutationFn: async () => {
      if (!scenario) throw new Error("Scenario not found");
      const history = turns.map((t) => ({ role: t.role, content: t.content }));
      return sumFn({
        data: {
          track: scenario.track,
          scenario: {
            title: scenario.title,
            role: scenario.role,
            setting: scenario.setting,
            goal: scenario.goal,
          },
          history,
        },
      });
    },
    onSuccess: async (data) => {
      setSummary(data);
      // Reward XP for finishing a conversation
      const uid = userQ.data;
      if (uid) {
        const { data: prog } = await supabase
          .from("user_progress")
          .select("xp")
          .eq("user_id", uid)
          .maybeSingle();
        const newXp = (prog?.xp ?? 0) + 25;
        await supabase.from("user_progress").update({ xp: newXp }).eq("user_id", uid);
        toast.success("+25 XP earned");
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Couldn't summarize."),
  });

  function startListening() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      toast.error(
        "Speech recognition isn't supported in this browser. Try Chrome on desktop or Android."
      );
      return;
    }
    const r = new Ctor();
    r.lang = SR_LANG[track];
    r.continuous = true;
    r.interimResults = true;
    let finalText = input ? input + " " : "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const chunk = res[0].transcript;
        if (res.isFinal) finalText += chunk + " ";
        else interim += chunk;
      }
      setInput((finalText + interim).replace(/\s+/g, " ").trimStart());
    };
    r.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") toast.error(`Mic error: ${e.error}`);
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    setListening(true);
    try {
      r.start();
    } catch {
      setListening(false);
    }
  }

  function stopListening() {
    try {
      recogRef.current?.stop();
    } catch {
      /* noop */
    }
    setListening(false);
  }

  function send() {
    const text = input.trim();
    if (!text || sendMutation.isPending || summary) return;
    if (listening) stopListening();
    setTurns((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    sendMutation.mutate(text);
  }

  function restart() {
    if (!scenario) return;
    setSummary(null);
    setTurns([
      {
        role: "assistant",
        content: scenario.opening,
        translation: scenario.openingTranslation,
      },
    ]);
    setTimeout(() => speakWithSlot(scenario.opening, targetVoice), 200);
  }

  if (!scenario) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Scenario not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          It may have been renamed or removed.
        </p>
        <Link
          to="/conversations"
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to Conversations
        </Link>
      </div>
    );
  }

  const learnerTurnCount = turns.filter((t) => t.role === "user").length;

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col px-4 py-4 sm:px-6 md:h-screen md:py-6">
      {/* Header */}
      <header className="mb-3 flex items-start gap-3">
        <Link
          to="/conversations"
          className="mt-1 rounded-full p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-background text-2xl shadow">
          {scenario.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-lg font-bold sm:text-xl">{scenario.title}</h1>
          <p className="truncate text-xs text-muted-foreground">{scenario.setting}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => summaryMutation.mutate()}
          disabled={
            summaryMutation.isPending || learnerTurnCount === 0 || summary !== null
          }
          className="rounded-full"
        >
          {summaryMutation.isPending ? (
            <>
              <Loader2 className="mr-1 size-3.5 animate-spin" /> Scoring
            </>
          ) : (
            <>
              <Flag className="mr-1 size-3.5" /> End
            </>
          )}
        </Button>
      </header>

      {/* Chat scroll area */}
      <div
        ref={scrollRef}
        className="glass-panel flex-1 space-y-4 overflow-y-auto rounded-2xl p-4"
      >
        <AnimatePresence initial={false}>
          {turns.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col gap-2",
                t.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
                  t.role === "user"
                    ? "rounded-br-md bg-brand text-brand-foreground"
                    : "rounded-bl-md border border-border bg-background/80"
                )}
              >
                <div className="flex items-start gap-2">
                  <p className="whitespace-pre-wrap">{t.content}</p>
                  {t.role === "assistant" && (
                    <button
                      onClick={() => speakWithSlot(t.content, targetVoice)}
                      className="mt-0.5 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label="Hear again"
                    >
                      <Volume2 className="size-3.5" />
                    </button>
                  )}
                </div>
                {t.role === "assistant" && t.translation && (
                  <details className="mt-1 text-xs opacity-70">
                    <summary className="cursor-pointer select-none hover:opacity-100">
                      Show meaning
                    </summary>
                    <div className="mt-1 flex items-start gap-2">
                      <p>{t.translation}</p>
                      <button
                        onClick={() => speakWithSlot(t.translation!, explainVoice)}
                        className="shrink-0 rounded p-0.5 hover:bg-accent"
                        aria-label="Hear translation"
                      >
                        <Volume2 className="size-3" />
                      </button>
                    </div>
                  </details>
                )}
              </div>
              {/* Corrections + hint under the learner's own message */}
              {t.role === "user" && (t.corrections?.length || t.hint) && (
                <div className="w-full max-w-[85%] space-y-2">
                  {t.corrections && t.corrections.length > 0 && (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs">
                      <div className="mb-1.5 flex items-center gap-1.5 font-semibold text-amber-700">
                        <AlertCircle className="size-3.5" /> Corrections
                      </div>
                      <ul className="space-y-1.5">
                        {t.corrections.map((c, k) => (
                          <li key={k}>
                            <div className="flex flex-wrap items-baseline gap-1.5">
                              <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-red-700 line-through">
                                {c.original}
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="rounded bg-green-500/10 px-1.5 py-0.5 font-semibold text-green-700">
                                {c.corrected}
                              </span>
                            </div>
                            <p className="mt-1 text-muted-foreground">{c.explanation}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {t.hint && (
                    <div className="flex items-start gap-2 rounded-xl border border-brand/30 bg-brand-soft p-3 text-xs text-brand">
                      <Lightbulb className="mt-0.5 size-3.5 shrink-0" />
                      <span>{t.hint}</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {sendMutation.isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </span>
            {scenario.role} is typing…
          </div>
        )}

        {/* Summary card */}
        {summary && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border-2 border-brand/30 bg-gradient-to-br from-brand-soft to-background p-5"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold">
                <Sparkles className="size-5 text-brand" /> Session review
              </h2>
              <div className="font-display text-3xl font-bold">
                {summary.fluencyScore}
                <span className="text-base text-muted-foreground">/100</span>
              </div>
            </div>
            <p className="mt-2 text-sm text-brand">{summary.encouragement}</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-3">
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-green-700">
                  <CheckCircle2 className="size-3.5" /> Strengths
                </h3>
                <ul className="space-y-1 text-xs">
                  {summary.strengths.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                <h3 className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
                  <AlertCircle className="size-3.5" /> Work on
                </h3>
                <ul className="space-y-1 text-xs">
                  {summary.improvements.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
              </div>
            </div>

            {summary.newVocabulary.length > 0 && (
              <div className="mt-3 rounded-xl border border-border bg-background/60 p-3">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  New vocabulary
                </h3>
                <ul className="grid gap-1.5 sm:grid-cols-2">
                  {summary.newVocabulary.map((v, i) => (
                    <li key={i} className="flex items-baseline gap-2 text-xs">
                      <button
                        onClick={() => speakWithSlot(v.word, targetVoice)}
                        className="font-semibold hover:underline"
                      >
                        {v.word}
                      </button>
                      <span className="text-muted-foreground">— {v.meaning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-3 rounded-xl border border-brand/30 bg-background/60 p-3 text-xs">
              <span className="font-semibold text-brand">Try next: </span>
              {summary.nextScenarioIdea}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button onClick={restart} className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
                <RefreshCw className="mr-2 size-4" /> Try again
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/conversations">Pick another scenario</Link>
              </Button>
            </div>
          </motion.section>
        )}
      </div>

      {/* Composer */}
      {!summary && (
        <div className="mt-3 rounded-2xl border border-border bg-background/80 p-2 shadow-sm backdrop-blur">
          <div className="flex items-end gap-2">
            <button
              onClick={listening ? stopListening : startListening}
              disabled={!supported || sendMutation.isPending}
              className={cn(
                "relative grid size-11 shrink-0 place-items-center rounded-full text-white shadow-md transition-transform",
                listening ? "bg-red-500" : "bg-brand hover:scale-105",
                (!supported || sendMutation.isPending) && "opacity-40"
              )}
              aria-label={listening ? "Stop recording" : "Start recording"}
              title={supported ? "Speak your reply" : "Speech recognition not available"}
            >
              {listening ? <Square className="size-4 fill-white" /> : <Mic className="size-5" />}
              {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={listening ? "Listening…" : `Reply in ${scenario.title.split(" ")[0]}… or tap the mic`}
              rows={1}
              className="max-h-32 flex-1 resize-none rounded-xl bg-transparent px-2 py-2 text-sm focus:outline-none"
            />
            <Button
              onClick={send}
              disabled={sendMutation.isPending || !input.trim()}
              className="shrink-0 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
              size="sm"
            >
              {sendMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
