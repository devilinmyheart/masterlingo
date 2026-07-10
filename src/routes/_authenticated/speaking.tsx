import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Loader2, Sparkles, Volume2, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { analyzeSpeaking, type SpeakingFeedback } from "@/lib/speaking.functions";
import { useVoicePrefs, speakWithSlot } from "@/lib/voice-prefs";

export const Route = createFileRoute("/_authenticated/speaking")({
  head: () => ({
    meta: [
      { title: "Speaking Practice — LingoMaster" },
      { name: "description", content: "Speak in English and get an instantly corrected transcript, example sentences and pronunciation tips." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/speaking" }],
  }),
  component: SpeakingPage,
});

type TrackId = "english" | "hindi_english";

const TRACKS: { id: TrackId; label: string; flag: string; hint: string }[] = [
  { id: "english", label: "English", flag: "🇬🇧", hint: "Full feedback in English." },
  { id: "hindi_english", label: "Hindi → English", flag: "🇮🇳", hint: "अंग्रेज़ी बोलें — feedback हिन्दी में।" },
];

const SCENARIOS: Record<TrackId, string[]> = {
  english: [
    "Introduce yourself in a job interview.",
    "Tell a colleague about your weekend plans.",
    "Order coffee and a sandwich at a café.",
    "Politely disagree with a teammate in a meeting.",
    "Describe a problem to a customer support agent.",
  ],
  hindi_english: [
    "दुकानदार से अंग्रेज़ी में सामान की कीमत पूछिए।",
    "किसी नए सहकर्मी से अंग्रेज़ी में परिचय दीजिए।",
    "डॉक्टर को अंग्रेज़ी में अपने लक्षण बताइए।",
    "फ़ोन पर अंग्रेज़ी में कैब बुक कीजिए।",
    "इंटरव्यू में अपनी strengths अंग्रेज़ी में बताइए।",
  ],
};

// Minimal Web Speech typings (browser-only).
type SR = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type SRCtor = new () => SR;

function getRecognitionCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function SpeakingPage() {
  const [track, setTrack] = useState<TrackId>("english");
  const [scenario, setScenario] = useState<string>(SCENARIOS.english[0]);
  const [transcript, setTranscript] = useState("");
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const recogRef = useRef<SR | null>(null);
  const [prefs] = useVoicePrefs();

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
    return () => {
      try { recogRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  useEffect(() => {
    setScenario(SCENARIOS[track][0]);
    setTranscript("");
    setFeedback(null);
  }, [track]);

  const analyze = useServerFn(analyzeSpeaking);
  const mutation = useMutation({
    mutationFn: (payload: { language: TrackId; transcript: string; prompt: string }) =>
      analyze({ data: payload }),
    onSuccess: (data) => setFeedback(data),
    onError: (err) => toast.error(err instanceof Error ? err.message : "Coaching failed"),
  });

  function startListening() {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      setSupported(false);
      toast.error("Speech recognition isn't supported in this browser. Try Chrome on desktop or Android.");
      return;
    }
    const r = new Ctor();
    // English speech either way — the learner is speaking English.
    r.lang = track === "hindi_english" ? "en-IN" : (prefs.english.lang || "en-US");
    r.continuous = true;
    r.interimResults = true;
    let finalText = transcript ? transcript + " " : "";
    r.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i];
        const chunk = res[0].transcript;
        if (res.isFinal) finalText += chunk + " ";
        else interim += chunk;
      }
      setTranscript((finalText + interim).replace(/\s+/g, " ").trimStart());
    };
    r.onerror = (e) => {
      if (e.error !== "no-speech" && e.error !== "aborted") {
        toast.error(`Mic error: ${e.error}`);
      }
    };
    r.onend = () => setListening(false);
    recogRef.current = r;
    setListening(true);
    setFeedback(null);
    try { r.start(); } catch { setListening(false); }
  }

  function stopListening() {
    try { recogRef.current?.stop(); } catch { /* noop */ }
    setListening(false);
  }

  function submit() {
    if (!transcript.trim()) {
      toast.error("Record or type something first.");
      return;
    }
    mutation.mutate({ language: track, transcript: transcript.trim(), prompt: scenario });
  }

  function speak(text: string) {
    const slot = track === "hindi_english" ? prefs.hindi_english.target : prefs.english;
    speakWithSlot(text, slot);
  }
  function speakGloss(text: string) {
    speakWithSlot(text, prefs.hindi_english.gloss);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <header className="mb-6 flex flex-wrap items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-brand to-english text-white shadow-lg">
          <Mic className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Speaking Practice</h1>
          <p className="text-sm text-muted-foreground">Speak English, get a corrected transcript and model sentences in seconds.</p>
        </div>
      </header>

      {/* Track selector */}
      <div className="mb-4 flex flex-wrap gap-2">
        {TRACKS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTrack(t.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all",
              track === t.id ? "border-transparent bg-foreground text-background" : "border-border bg-background hover:bg-accent"
            )}
          >
            <span>{t.flag}</span> {t.label}
          </button>
        ))}
        <p className="w-full text-xs text-muted-foreground">{TRACKS.find((t) => t.id === track)?.hint}</p>
      </div>

      {/* Scenario */}
      <div className="glass-panel mb-4 rounded-2xl p-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scenario</label>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          {SCENARIOS[track].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Recorder */}
      <div className="glass-panel rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={listening ? stopListening : startListening}
              disabled={!supported}
              className={cn(
                "relative grid size-16 place-items-center rounded-full text-white shadow-lg transition-all",
                listening ? "bg-red-500 shadow-red-500/40" : "bg-brand shadow-brand/40 hover:scale-105",
                !supported && "opacity-40 cursor-not-allowed"
              )}
              aria-label={listening ? "Stop recording" : "Start recording"}
            >
              {listening ? <Square className="size-6 fill-white" /> : <Mic className="size-6" />}
              {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/40" />}
            </button>
            <div>
              <div className="font-semibold">{listening ? "Listening…" : supported ? "Tap to speak" : "Speech recognition unavailable"}</div>
              <div className="text-xs text-muted-foreground">
                {supported ? "Speak in full sentences. Tap again to stop." : "Try Chrome on desktop or Android."}
              </div>
            </div>
          </div>
          <Button
            onClick={submit}
            disabled={mutation.isPending || !transcript.trim()}
            className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {mutation.isPending ? <><Loader2 className="mr-2 size-4 animate-spin" /> Coaching…</> : <><Sparkles className="mr-2 size-4" /> Get feedback</>}
          </Button>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Your transcript will appear here — you can also type or edit it before submitting."
          rows={4}
          className="mt-4 w-full resize-y rounded-xl border border-border bg-background/80 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
        />
      </div>

      {/* Feedback */}
      <AnimatePresence mode="wait">
        {feedback && (
          <motion.section
            key={feedback.correctedTranscript}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 space-y-4"
          >
            {/* Score + corrected */}
            <div className="glass-panel rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Fluency score</div>
                  <div className="mt-1 font-display text-4xl font-bold">
                    {feedback.fluencyScore}
                    <span className="text-lg text-muted-foreground">/100</span>
                  </div>
                </div>
                <div className="max-w-md rounded-xl bg-brand-soft px-4 py-3 text-sm text-brand">
                  {feedback.encouragement}
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    You said
                  </div>
                  <p className="rounded-xl border border-border bg-background/60 p-3 text-sm leading-relaxed">
                    {feedback.originalTranscript}
                  </p>
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-green-700">
                    <CheckCircle2 className="size-3.5" /> Corrected
                  </div>
                  <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-3">
                    <p className="text-sm leading-relaxed">{feedback.correctedTranscript}</p>
                    <button
                      onClick={() => speak(feedback.correctedTranscript)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline"
                    >
                      <Volume2 className="size-3.5" /> Hear it
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Corrections */}
            {feedback.corrections.length > 0 && (
              <div className="glass-panel rounded-2xl p-5">
                <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
                  <AlertCircle className="size-4 text-amber-600" /> Corrections
                </h2>
                <ul className="space-y-3">
                  {feedback.corrections.map((c, i) => (
                    <li key={i} className="rounded-xl border border-border p-3">
                      <div className="flex flex-wrap items-baseline gap-2 text-sm">
                        <span className="rounded bg-red-500/10 px-2 py-0.5 text-red-700 line-through">{c.original}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="rounded bg-green-500/10 px-2 py-0.5 font-semibold text-green-700">{c.corrected}</span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{c.explanation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Examples */}
            {feedback.targetLanguageExamples.length > 0 && (
              <div className="glass-panel rounded-2xl p-5">
                <h2 className="mb-3 font-display text-lg font-bold">Try saying it like this</h2>
                <ul className="space-y-3">
                  {feedback.targetLanguageExamples.map((ex, i) => (
                    <li key={i} className="rounded-xl border border-border bg-background/60 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-semibold">{ex.text}</p>
                        <div className="flex shrink-0 gap-1">
                          <button
                            onClick={() => speak(ex.text)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Speak English"
                          >
                            <Volume2 className="size-4" />
                          </button>
                          {track === "hindi_english" && (
                            <button
                              onClick={() => speakGloss(ex.translation)}
                              className="rounded-lg p-1.5 text-hindi hover:bg-accent"
                              aria-label="Speak Hindi translation"
                              title="हिन्दी में सुनें"
                            >
                              <Volume2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{ex.translation}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pronunciation tips + follow-up */}
            <div className="grid gap-4 md:grid-cols-2">
              {feedback.pronunciationTips.length > 0 && (
                <div className="glass-panel rounded-2xl p-5">
                  <h2 className="mb-3 font-display text-lg font-bold">Pronunciation tips</h2>
                  <ul className="space-y-2 text-sm">
                    {feedback.pronunciationTips.map((tip, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="glass-panel rounded-2xl p-5">
                <h2 className="mb-2 font-display text-lg font-bold">Keep going</h2>
                <p className="text-sm">{feedback.followUpPrompt}</p>
                <Button
                  onClick={() => { setTranscript(""); setFeedback(null); startListening(); }}
                  variant="outline"
                  className="mt-3 rounded-full"
                >
                  <RefreshCw className="mr-2 size-4" /> Answer with your voice
                </Button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
