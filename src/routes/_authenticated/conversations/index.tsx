import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MessagesSquare, ChevronRight, Sparkles } from "lucide-react";
import { scenariosForTrack, type ScenarioTrack, type Scenario } from "@/data/scenarios";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/conversations/")({
  head: () => ({
    meta: [
      { title: "Conversations — Master Lingo" },
      {
        name: "description",
        content:
          "Practise real conversations with an AI language partner. Roleplay everyday scenes in French, German, Japanese, English and Hindi-to-English.",
      },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/conversations" }],
  }),
  component: ConversationsIndex,
});

const TRACK_LABEL: Record<ScenarioTrack, { label: string; flag: string; accent: string }> = {
  french: { label: "French", flag: "🇫🇷", accent: "from-french/20 to-brand/10" },
  german: { label: "German", flag: "🇩🇪", accent: "from-german/20 to-brand/10" },
  japanese: { label: "Japanese", flag: "🇯🇵", accent: "from-japanese/20 to-brand/10" },
  english: { label: "English", flag: "🇬🇧", accent: "from-english/20 to-brand/10" },
  hindi_english: { label: "Hindi → English", flag: "🇮🇳", accent: "from-hindi/20 to-brand/10" },
};

const LEVEL_COLOR: Record<string, string> = {
  A1: "bg-emerald-500/15 text-emerald-700",
  A2: "bg-emerald-500/15 text-emerald-700",
  B1: "bg-amber-500/15 text-amber-700",
  B2: "bg-orange-500/15 text-orange-700",
  C1: "bg-rose-500/15 text-rose-700",
};

function ConversationsIndex() {
  const { data: onboarding } = useQuery({
    queryKey: ["conversations-onboarding"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_onboarding")
        .select("language")
        .maybeSingle();
      return data;
    },
  });

  const track = (onboarding?.language as ScenarioTrack | undefined) ?? "english";
  const scenarios = scenariosForTrack(track);
  const meta = TRACK_LABEL[track];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex flex-wrap items-center gap-3">
        <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-brand to-french text-white shadow-lg">
          <MessagesSquare className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Conversations</h1>
          <p className="text-sm text-muted-foreground">
            Roleplay real scenes with your AI partner. Speak or type — you'll get gentle
            corrections after every turn.
          </p>
        </div>
        <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1.5 text-sm font-semibold text-brand">
          <span>{meta.flag}</span> {meta.label}
        </span>
      </header>

      {scenarios.length === 0 ? (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <Sparkles className="mx-auto mb-3 size-8 text-brand" />
          <p className="text-sm text-muted-foreground">
            No conversation scenarios yet for this language — check back soon!
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {scenarios.map((s) => (
            <ScenarioCard key={s.id} scenario={s} accent={meta.accent} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario, accent }: { scenario: Scenario; accent: string }) {
  return (
    <Link
      to="/conversations/$scenarioId"
      params={{ scenarioId: scenario.id }}
      className="group glass-panel relative overflow-hidden rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-xl"
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-60",
          accent
        )}
      />
      <div className="relative flex items-start gap-4">
        <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-background/80 text-3xl backdrop-blur">
          {scenario.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider",
                LEVEL_COLOR[scenario.level] ?? "bg-muted text-muted-foreground"
              )}
            >
              {scenario.level}
            </span>
          </div>
          <h2 className="font-display text-lg font-bold leading-tight">{scenario.title}</h2>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{scenario.setting}</p>
        </div>
        <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
