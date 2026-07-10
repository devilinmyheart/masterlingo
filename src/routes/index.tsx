import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Mic, BookOpen, Trophy, Globe, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { LANGUAGE_LIST } from "@/data/curriculum";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LingoMaster — Learn French, German & Japanese with AI" },
      {
        name: "description",
        content:
          "Premium AI-powered language learning. Master French, German, and Japanese from A1 to C2 with adaptive lessons, native audio, and an always-on AI tutor.",
      },
      { property: "og:title", content: "LingoMaster — Learn French, German & Japanese with AI" },
      {
        property: "og:description",
        content:
          "Premium AI-powered language learning. Master French, German, and Japanese from A1 to C2 with adaptive lessons, native audio, and an always-on AI tutor.",
      },
      { property: "og:url", content: "https://masterlingo.lovable.app/" },
      { name: "twitter:title", content: "LingoMaster — Learn French, German & Japanese with AI" },
      { name: "twitter:description", content: "Premium AI-powered language learning. Master French, German, and Japanese from A1 to C2 with adaptive lessons, native audio, and an always-on AI tutor." },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://masterlingo.lovable.app/#organization",
              name: "LingoMaster",
              url: "https://masterlingo.lovable.app/",
              logo: "https://masterlingo.lovable.app/favicon.ico",
              description:
                "Premium AI-powered language learning for French, German, and Japanese from A1 to C2.",
            },
            {
              "@type": "WebSite",
              "@id": "https://masterlingo.lovable.app/#website",
              url: "https://masterlingo.lovable.app/",
              name: "LingoMaster",
              publisher: { "@id": "https://masterlingo.lovable.app/#organization" },
              inLanguage: "en",
            },
            {
              "@type": "FAQPage",
              mainEntity: FAQS.map((f) => ({
                "@type": "Question",
                name: f.q,
                acceptedAnswer: { "@type": "Answer", text: f.a },
              })),
            },
          ],
        }),
      },
    ],
  }),
  component: Landing,
});

const LANG_STYLES: Record<string, { chipBg: string; chipText: string; ring: string; bar: string }> = {
  french: {
    chipBg: "bg-french-soft",
    chipText: "text-french",
    ring: "hover:shadow-french/20",
    bar: "bg-french",
  },
  german: {
    chipBg: "bg-german-soft",
    chipText: "text-german-ink",
    ring: "hover:shadow-german/20",
    bar: "bg-german",
  },
  japanese: {
    chipBg: "bg-japanese-soft",
    chipText: "text-japanese",
    ring: "hover:shadow-japanese/20",
    bar: "bg-japanese",
  },
  english: {
    chipBg: "bg-english-soft",
    chipText: "text-english",
    ring: "hover:shadow-english/20",
    bar: "bg-english",
  },
  hindi_english: {
    chipBg: "bg-hindi-soft",
    chipText: "text-hindi-ink",
    ring: "hover:shadow-hindi/20",
    bar: "bg-hindi",
  },
};

function Landing() {
  return (
    <div className="bg-aurora min-h-screen text-foreground">
      <TopNav />
      <main>
        <Hero />
        <LanguageSection />
        <FeaturesSection />
        <TutorPreview />
        <Testimonials />
        <Pricing />
        <FAQ />
      </main>
      <SiteFooter />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-tr from-brand via-french to-japanese shadow-lg shadow-brand/20">
            <Globe className="size-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">LingoMaster</span>
        </Link>
        <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="#languages" className="transition-colors hover:text-foreground">Languages</a>
          <a href="#features" className="transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
          <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Link to="/auth" search={{ mode: "signup" }}>Start free</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 pb-24 pt-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            <Sparkles className="size-3.5" /> AI-Powered Mastery
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Fluency is a <em className="not-italic text-brand">feeling</em>,<br className="hidden sm:block" /> not a chore.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
            Master French, German, or Japanese with a curriculum that adapts to how you think — powered by an AI tutor that never sleeps.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-brand px-8 py-6 text-base font-semibold text-brand-foreground shadow-2xl shadow-brand/25 hover:bg-brand/90">
              <Link to="/auth" search={{ mode: "signup" }}>
                Start learning free <ArrowRight className="ml-1 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-border bg-background/60 px-8 py-6 text-base font-semibold backdrop-blur">
              <a href="#languages">Explore languages</a>
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {["#4f46e5", "#0055A4", "#dc2626", "#f59e0b"].map((c) => (
                <div key={c} className="size-9 rounded-full border-2 border-background" style={{ background: c }} />
              ))}
            </div>
            <span>Joining <strong className="text-foreground">12,480</strong> learners this month</span>
          </div>
        </motion.div>

        <AnimatedGlobe />
      </div>
    </section>
  );
}

function AnimatedGlobe() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      className="relative mx-auto aspect-square w-full max-w-[560px]"
    >
      <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-tr from-french/20 via-brand/20 to-japanese/20 blur-3xl" />
      {/* Orbit rings */}
      <div
        className="absolute inset-6 rounded-full border border-brand/20"
        style={{ animation: "spin-slow 40s linear infinite" }}
      />
      <div
        className="absolute inset-16 rounded-full border border-french/20"
        style={{ animation: "spin-slow 60s linear infinite reverse" }}
      />
      <div
        className="absolute inset-28 rounded-full border border-japanese/20"
        style={{ animation: "spin-slow 30s linear infinite" }}
      />
      {/* Glass core */}
      <div className="glass-panel absolute inset-32 grid place-items-center rounded-full shadow-2xl">
        <div className="text-center">
          <Globe className="mx-auto size-10 text-brand" strokeWidth={1.5} />
          <div className="mt-2 font-display text-2xl font-bold">LingoMaster</div>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-foreground/70">A1 → C2</div>
        </div>
      </div>
      {/* Floating language chips */}
      {[
        { label: "🇫🇷 Bonjour", pos: "top-4 left-8", color: "text-french", delay: 0 },
        { label: "🇩🇪 Hallo", pos: "top-14 right-6", color: "text-german-ink", delay: 0.6 },
        { label: "🇯🇵 こんにちは", pos: "bottom-24 left-2", color: "text-japanese", delay: 1.2 },
        { label: "🇬🇧 Hello", pos: "top-32 left-4", color: "text-english", delay: 0.9 },
        { label: "🇮🇳 नमस्ते", pos: "bottom-6 left-16", color: "text-hindi-ink", delay: 1.5 },
        { label: "🇫🇷 Merci", pos: "bottom-4 right-12", color: "text-french", delay: 0.3 },
      ].map((chip) => (
        <div
          key={chip.label}
          className={`glass-panel absolute ${chip.pos} rounded-full px-3 py-1.5 text-sm font-semibold ${chip.color} shadow-lg`}
          style={{ animation: `float-slow 5s ease-in-out ${chip.delay}s infinite` }}
        >
          {chip.label}
        </div>
      ))}
    </motion.div>
  );
}

function LanguageSection() {
  return (
    <section id="languages" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Choose your path</h2>
          <p className="mt-2 text-muted-foreground">Each curriculum hand-crafted from A1 to C2.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {LANGUAGE_LIST.map((lang, i) => {
          const s = LANG_STYLES[lang.id];
          const lessonCount = lang.levels.reduce((n, lvl) => n + lvl.topics.length, 0);
          return (
            <motion.div
              key={lang.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className={`glass-panel group relative flex h-full flex-col overflow-hidden rounded-3xl p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${s.ring}`}
              >
                <div className={`absolute -right-12 -top-12 size-40 rounded-full ${s.chipBg} opacity-40 transition-transform duration-700 group-hover:scale-150`} />
                <div className={`relative z-10 inline-flex size-12 items-center justify-center rounded-xl ${s.chipBg} text-2xl`}>
                  {lang.flag}
                </div>
                <h3 className="relative z-10 mt-6 font-display text-3xl font-bold">{lang.nativeName}</h3>
                <div className={`relative z-10 mt-1 text-sm font-semibold ${s.chipText}`}>{lang.name}</div>
                <p className="relative z-10 mt-4 text-sm leading-relaxed text-muted-foreground">{lang.tagline}</p>
                <div className="relative z-10 mt-auto pt-8">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <span>A1 → C2</span>
                    <span className={s.chipText}>{lessonCount} lessons</span>
                  </div>
                  <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full w-3/4 ${s.bar}`} />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Sparkles, title: "AI Tutor 24/7", body: "Chat, ask, translate, and drill grammar with an always-on tutor." },
  { icon: Mic, title: "Pronunciation Coach", body: "Get instant accuracy, fluency, and accent feedback." },
  { icon: BookOpen, title: "Spaced Repetition", body: "Our SRS predicts when you'll forget — and brings the word back." },
  { icon: Trophy, title: "Streaks & XP", body: "Gamified progress, achievements, and global leaderboards." },
];

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Built for serious learners</h2>
        <p className="mt-3 text-muted-foreground">Everything Duolingo has, plus the depth Babbel skips.</p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-panel rounded-3xl p-6 shadow-lg"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function TutorPreview() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="glass-panel grid gap-12 rounded-4xl p-8 shadow-2xl md:p-16 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-japanese-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-japanese">
            <Sparkles className="size-3.5" /> AI Tutor
          </div>
          <h2 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-5xl">
            A patient tutor,<br /> at your speed.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ask "why does French use <em>en</em> here?" — get a clear explanation, examples, and a two-minute drill built just for you.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {["Explain grammar in plain English", "Translate with cultural context", "Correct your writing", "Roleplay real conversations"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <Check className="size-4 text-brand" /> {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-glass-border bg-card p-6 shadow-2xl">
          <div className="mb-6 flex items-center gap-2 border-b border-border pb-4">
            <div className="size-3 rounded-full bg-japanese" />
            <div className="size-3 rounded-full bg-german" />
            <div className="size-3 rounded-full bg-french" />
            <div className="ml-auto font-mono text-xs text-muted-foreground">tutor · français</div>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                <Sparkles className="size-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-muted px-4 py-3 text-sm leading-relaxed">
                Décris ton week-end à Paris au passé composé. 🇫🇷
              </div>
            </div>
            <div className="flex flex-row-reverse gap-3">
              <div className="size-9 shrink-0 rounded-full bg-french" />
              <div className="rounded-2xl rounded-tr-none bg-french px-4 py-3 text-sm leading-relaxed text-white">
                J'ai mangé un croissant près de la Tour Eiffel.
              </div>
            </div>
            <div className="rounded-2xl border border-brand/20 bg-brand-soft/50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-wider text-brand">Feedback</div>
              <p className="mt-1 text-xs leading-relaxed text-foreground/90">
                Parfait ! Accuracy 98 · Fluency 92. Next time try "<em>incroyable</em>" for extra flavor.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "Chloé D.", role: "Software engineer, Berlin", quote: "The AI tutor unblocked me. I finally understand the German cases.", stars: 5 },
  { name: "Marcus O.", role: "MBA student, London", quote: "Passed DELF B2 in four months. The pronunciation coach is the real deal.", stars: 5 },
  { name: "Aiko T.", role: "Marketing lead, NYC", quote: "Finally a Japanese app that respects your intelligence.", stars: 5 },
];

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Loved by learners</h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <div key={t.name} className="glass-panel rounded-3xl p-6 shadow-lg">
            <div className="flex gap-0.5">
              {Array.from({ length: t.stars }).map((_, i) => (
                <Star key={i} className="size-4 fill-german text-german" />
              ))}
            </div>
            <p className="mt-4 text-sm leading-relaxed">"{t.quote}"</p>
            <div className="mt-6 text-sm font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Invest in yourself</h2>
        <p className="mt-3 text-muted-foreground">Start free. Upgrade when you're serious.</p>
      </div>
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
        <div className="glass-panel rounded-3xl p-8 shadow-lg">
          <h3 className="text-lg font-bold uppercase tracking-wide">BASIC</h3>
          <div className="mt-4 font-display text-4xl font-bold">
            Free
          </div>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            {["Daily lessons in one language", "Basic vocabulary tracker", "Community leaderboards"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="size-4 text-brand" /> {f}</li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-8 w-full rounded-full">
            <Link to="/auth" search={{ mode: "signup" }}>Start free</Link>
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 text-background shadow-2xl">
          <div className="absolute right-4 top-4 rounded-full bg-german px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-german-ink">Most Popular</div>
          <h3 className="text-lg font-bold">{"\n"}</h3>
          <div className="mt-4 font-display text-4xl font-bold">
            $1<span className="text-base font-normal opacity-60">/month</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm opacity-90">
            {["All languages", "Unlimited AI tutor", "Native audio downloads", "Offline mode", "No ads"].map((f) => (
              <li key={f} className="flex items-center gap-2"><Check className="size-4 text-german" /> {f}</li>
            ))}
          </ul>
          <Button asChild className="mt-8 w-full rounded-full bg-brand text-brand-foreground shadow-xl shadow-brand/40 hover:bg-brand/90">
            <Link to="/auth" search={{ mode: "signup" }}>Start 7-day free trial</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  {
    q: "Is the curriculum aligned with official standards?",
    a: "Yes. French and German follow the CEFR framework (A1–C2). Japanese also maps to JLPT levels (N5–N1).",
  },
  {
    q: "How does the AI pronunciation coach work?",
    a: "You record a phrase; our acoustic engine compares your phonetics to native speakers and returns accuracy, fluency, and per-word feedback.",
  },
  {
    q: "Can I switch languages later?",
    a: "Yes. You can add or switch active languages any time in settings.",
  },
  {
    q: "Do you have a free plan?",
    a: "Yes — Explorer is free forever with daily lessons in one language. Upgrade any time.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-24 sm:px-6">
      <div className="text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Common questions</h2>
      </div>
      <Accordion type="single" collapsible className="mt-8">
        {FAQS.map((f) => (
          <AccordionItem key={f.q} value={f.q} className="border-border">
            <AccordionTrigger className="text-left text-base font-semibold">{f.q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background/50 py-16 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-tr from-brand via-french to-japanese">
              <Globe className="size-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-display text-lg font-bold">LingoMaster</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Premium AI-powered language learning. Master French, German & Japanese.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Languages</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="#languages" className="text-muted-foreground hover:text-french">French</a></li>
            <li><a href="#languages" className="text-muted-foreground hover:text-german-ink">German</a></li>
            <li><a href="#languages" className="text-muted-foreground hover:text-japanese">Japanese</a></li>
            <li><a href="#languages" className="text-muted-foreground hover:text-english">English</a></li>
            <li><a href="#languages" className="text-muted-foreground hover:text-hindi-ink">English (Hindi speakers)</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
            <li><a href="#faq" className="hover:text-foreground">FAQ</a></li>
            <li><a href="#pricing" className="hover:text-foreground">Pricing</a></li>
            <li><a href="/help" className="hover:text-foreground">Contact us</a></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-border px-4 pt-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} LingoMaster</span>
        <span>Made for learners worldwide</span>
      </div>
    </footer>
  );
}
