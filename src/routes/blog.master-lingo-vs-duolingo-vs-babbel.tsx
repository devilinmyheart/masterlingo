import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const TITLE = "Master Lingo vs Duolingo vs Babbel: The AI Language Learning Comparison (2026)";
const DESCRIPTION =
  "An honest, side-by-side comparison of Master Lingo, Duolingo and Babbel — pricing, AI tutoring, speaking practice and which app actually gets you to fluency.";
const URL = "https://masterlingo.lovable.app/blog/master-lingo-vs-duolingo-vs-babbel";

export const Route = createFileRoute("/blog/master-lingo-vs-duolingo-vs-babbel")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "keywords", content: "ai language learning, duolingo alternative, babbel alternative, master lingo vs duolingo, master lingo vs babbel, best ai language app" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          author: { "@type": "Person", name: "Mohammad Saduddin Atahar" },
          publisher: { "@type": "Organization", name: "Master Lingo" },
          datePublished: "2026-07-14",
          dateModified: "2026-07-14",
          mainEntityOfPage: URL,
          about: ["AI language learning", "Duolingo", "Babbel", "Master Lingo"],
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "Is Master Lingo better than Duolingo?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Duolingo is best for building a daily gamified habit. Master Lingo goes further: an always-on AI tutor answers 'why' questions, corrects your writing and speaking in real time, and adapts the curriculum instead of just gamifying it. If you want to reach real conversational fluency, Master Lingo's AI-first approach closes the gap Duolingo leaves at intermediate levels.",
              },
            },
            {
              "@type": "Question",
              name: "How is Master Lingo different from Babbel?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Babbel offers structured lessons written by linguists. Master Lingo layers a 24/7 AI tutor, live speaking practice with pronunciation scoring, and roleplay conversations on top of a CEFR curriculum (A1 → C2). Master Lingo is $1/month vs Babbel's $14.95/month.",
              },
            },
            {
              "@type": "Question",
              name: "Which app has the best AI tutor?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Master Lingo ships an unlimited AI tutor powered by Google Gemini that explains grammar, corrects sentences and roleplays real conversations. Duolingo's 'Max' AI tier costs about $30/month and Babbel's AI features are limited to short exercises.",
              },
            },
            {
              "@type": "Question",
              name: "Is Master Lingo free?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — the free plan includes daily lessons in one language and the vocabulary tracker. Pro unlocks all languages, unlimited AI tutor, speaking practice and no ads for $1/month with a 7-day free trial.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: ComparisonArticle,
});

const ROWS: { label: string; ml: string; duo: string; babbel: string; mlWin?: boolean }[] = [
  { label: "Starting price", ml: "$1 / month", duo: "Free (ads) · $6.99 Super", babbel: "$14.95 / month", mlWin: true },
  { label: "AI tutor (unlimited)", ml: "✓ Included", duo: "Only on Duolingo Max ($30/mo)", babbel: "Limited exercises", mlWin: true },
  { label: "Live speaking practice", ml: "✓ Real-time scoring", duo: "Basic mic exercises", babbel: "Yes, scripted", mlWin: true },
  { label: "Grammar deep-dives", ml: "✓ AI-generated on demand", duo: "Minimal", babbel: "✓ Human-written", mlWin: false },
  { label: "Conversation roleplay", ml: "✓ Any scenario, any level", duo: "Duo Max only", babbel: "Limited scenarios", mlWin: true },
  { label: "Curriculum framework", ml: "CEFR A1 → C2", duo: "Gamified path", babbel: "CEFR A1 → B2" },
  { label: "Languages available", ml: "5 (EN, FR, DE, JA, EN-for-Hindi)", duo: "40+", babbel: "14" },
  { label: "Ad-free", ml: "✓ (Pro)", duo: "✗ (unless paid)", babbel: "✓" },
  { label: "Free trial", ml: "7 days on Pro", duo: "2-week Super trial", babbel: "7-day money-back" },
];

function ComparisonArticle() {
  return (
    <div className="bg-aurora min-h-screen">
      <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 md:py-24">
        <nav className="mb-8 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          <span className="text-foreground">Blog</span>
        </nav>

        <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
          <Sparkles className="size-3.5" /> Comparison Guide
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
          Master Lingo vs Duolingo vs Babbel: which AI language app actually gets you fluent?
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Duolingo has the streaks. Babbel has the linguists. Master Lingo bets on something different: a real
          AI tutor that lives in your pocket, corrects your sentences the moment you write them, and roleplays
          the conversations you'll actually need. Here's an honest side-by-side of the three apps in 2026.
        </p>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-lg">
          <div className="grid grid-cols-4 gap-0 bg-foreground text-background">
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Feature</div>
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Master Lingo</div>
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Duolingo</div>
            <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider">Babbel</div>
          </div>
          {ROWS.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-4 gap-0 border-t border-border text-sm ${i % 2 === 0 ? "bg-background/40" : ""}`}
            >
              <div className="px-4 py-3 font-semibold">{row.label}</div>
              <div className={`px-4 py-3 ${row.mlWin ? "bg-brand-soft/60 font-semibold text-brand" : ""}`}>{row.ml}</div>
              <div className="px-4 py-3 text-muted-foreground">{row.duo}</div>
              <div className="px-4 py-3 text-muted-foreground">{row.babbel}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-14 font-display text-3xl font-bold tracking-tight">Why we built Master Lingo</h2>
        <p className="mt-3 text-muted-foreground">
          Most learners hit the same wall on Duolingo or Babbel: you can conjugate on paper but freeze in a
          real conversation. That gap — the one between doing exercises and actually speaking — is what an
          AI tutor is built for. Master Lingo's tutor is available 24/7, answers "why does French use{" "}
          <em>en</em> here?" in plain English, and drills the answer with you until it sticks.
        </p>

        <h2 className="mt-10 font-display text-3xl font-bold tracking-tight">Duolingo: the gamification king</h2>
        <p className="mt-3 text-muted-foreground">
          Duolingo is unmatched at building a daily habit. Streaks, XP, and leagues make the app impossible
          to put down. But once you reach the intermediate levels, most learners plateau — the exercises
          repeat, grammar explanations stay shallow, and the paid "Max" tier that adds AI conversations
          costs ~$30/month. Great for beginners; expensive to actually finish.
        </p>

        <h2 className="mt-10 font-display text-3xl font-bold tracking-tight">Babbel: the linguistics classroom</h2>
        <p className="mt-3 text-muted-foreground">
          Babbel's lessons are the most academically rigorous of the three. Real linguists write the courses,
          grammar is explained clearly, and the audio dialogues are excellent. The trade-off is price
          ($14.95/mo) and a mostly static curriculum — you cannot ask Babbel "why" the way you can ask a
          teacher.
        </p>

        <h2 className="mt-10 font-display text-3xl font-bold tracking-tight">Master Lingo: AI-first, CEFR-aligned</h2>
        <p className="mt-3 text-muted-foreground">
          Master Lingo combines Babbel's structure with an unlimited AI tutor and Duolingo-style gamification
          — at $1/month. You get a full CEFR path from A1 to C2, spaced-repetition vocabulary, live
          pronunciation scoring, roleplay conversations, and grammar deep-dives on demand. It's the tool
          for anyone who wants to actually use the language they're learning, not just collect streaks.
        </p>

        <h2 className="mt-10 font-display text-3xl font-bold tracking-tight">Which one should you pick?</h2>
        <ul className="mt-3 space-y-3 text-muted-foreground">
          <li className="flex gap-3">
            <Check className="mt-1 size-5 shrink-0 text-brand" />
            <span><strong>Pick Duolingo</strong> if you want the most fun-to-play habit tracker and don't mind ads.</span>
          </li>
          <li className="flex gap-3">
            <Check className="mt-1 size-5 shrink-0 text-brand" />
            <span><strong>Pick Babbel</strong> if you learn best from structured, linguist-written lessons and price isn't a factor.</span>
          </li>
          <li className="flex gap-3">
            <Check className="mt-1 size-5 shrink-0 text-brand" />
            <span><strong>Pick Master Lingo</strong> if you want an AI tutor, speaking practice, and a real path to fluency — for the price of a coffee.</span>
          </li>
        </ul>

        <div className="mt-14 rounded-3xl bg-foreground p-8 text-background shadow-2xl md:p-10">
          <h2 className="font-display text-2xl font-bold md:text-3xl">Try Master Lingo free for 7 days</h2>
          <p className="mt-2 text-sm opacity-90">
            All 5 languages, unlimited AI tutor, speaking practice — $1/month after your trial. Cancel any time.
          </p>
          <Link
            to="/auth"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-foreground shadow-xl shadow-brand/40 hover:bg-brand/90"
          >
            Start free trial <ArrowRight className="size-4" />
          </Link>
        </div>

        <h2 className="mt-14 font-display text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        <div className="mt-4 space-y-4">
          <FAQItem q="Is Master Lingo better than Duolingo?" a="Duolingo is best for building a daily gamified habit. Master Lingo goes further with an always-on AI tutor that answers 'why' questions and adapts the curriculum. If you want to reach real conversational fluency, Master Lingo closes the gap Duolingo leaves at intermediate levels." />
          <FAQItem q="How is Master Lingo different from Babbel?" a="Babbel offers structured lessons written by linguists. Master Lingo layers a 24/7 AI tutor, live speaking practice and roleplay conversations on top of a CEFR curriculum — for $1/month vs Babbel's $14.95/month." />
          <FAQItem q="Which app has the best AI tutor?" a="Master Lingo ships an unlimited AI tutor that explains grammar, corrects sentences and roleplays real conversations. Duolingo's Max AI tier costs about $30/month and Babbel's AI features are limited to short exercises." />
          <FAQItem q="Is Master Lingo free?" a="Yes — the free plan includes daily lessons in one language and the vocabulary tracker. Pro unlocks all languages, unlimited AI tutor and speaking practice for $1/month with a 7-day free trial." />
        </div>

        <p className="mt-10 text-xs text-muted-foreground">
          Prices and features accurate as of July 2026. Duolingo and Babbel are trademarks of their
          respective owners; this article is an independent comparison.
        </p>
      </article>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="glass-panel group rounded-2xl p-5">
      <summary className="cursor-pointer list-none font-semibold">
        <span className="mr-2 text-brand group-open:hidden">+</span>
        <span className="mr-2 hidden text-brand group-open:inline">−</span>
        {q}
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
    </details>
  );
}
