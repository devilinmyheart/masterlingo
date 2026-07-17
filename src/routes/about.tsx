import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Globe, Target, Heart, Award, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Master Lingo" },
      {
        name: "description",
        content:
          "Meet the team behind Master Lingo. Founded by Mohammad Saduddin Atahar, we combine AI and proven language science to help learners master new languages.",
      },
      { property: "og:title", content: "About Us — Master Lingo" },
      {
        property: "og:description",
        content:
          "Meet the team behind Master Lingo. Founded by Mohammad Saduddin Atahar, we combine AI and proven language science to help learners master new languages.",
      },
      { property: "og:url", content: "https://masterlingo.lovable.app/about" },
      { name: "twitter:title", content: "About Us — Master Lingo" },
      {
        name: "twitter:description",
        content:
          "Meet the team behind Master Lingo. Founded by Mohammad Saduddin Atahar, we combine AI and proven language science to help learners master new languages.",
      },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Master Lingo",
          url: "https://masterlingo.lovable.app/about",
          founder: { "@type": "Person", name: "Mohammad Saduddin Atahar" },
          address: {
            "@type": "PostalAddress",
            streetAddress: "Maharajganj",
            addressRegion: "Uttar Pradesh",
            postalCode: "273303",
            addressCountry: "IN",
          },
        }),
      },
    ],
  }),
  component: AboutPage,
});

const VALUES = [
  {
    icon: Target,
    title: "Purpose-driven learning",
    body: "Every lesson is built around a real-world goal — ordering coffee, negotiating a contract, or watching a film without subtitles.",
  },
  {
    icon: Sparkles,
    title: "AI that adapts to you",
    body: "Our tutor learns how you learn. It explains grammar in your words, remembers your mistakes, and celebrates your progress.",
  },
  {
    icon: Heart,
    title: "Made for humans",
    body: "No guilt, no grind for grind's sake. We design for curiosity, consistency, and the joy of finally being understood.",
  },
  {
    icon: Award,
    title: "Aligned with real standards",
    body: "French and German map to CEFR A1–C2. Japanese maps to JLPT. English and Hindi tracks prepare you for IELTS and everyday fluency.",
  },
];

function AboutPage() {
  return (
    <div className="bg-aurora min-h-screen text-foreground">
      <TopNav />
      <main>
        <Hero />
        <FounderSection />
        <ValuesSection />
        <CTASection />
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
          <span className="font-display text-xl font-bold tracking-tight">Master Lingo</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full bg-foreground text-background hover:bg-foreground/90">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start free
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 md:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand">
            Our story
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl">
            Language learning built with <em className="not-italic text-brand">care</em>.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Master Lingo was created to remove the friction between wanting to speak a language and actually speaking it.
            We blend adaptive AI, spaced repetition, and native audio into one elegant experience.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function FounderSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="glass-panel mx-auto max-w-4xl overflow-hidden rounded-4xl p-8 shadow-2xl md:p-16 lg:grid-cols-2">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-center">
          <div className="mx-auto lg:mx-0">
            <div className="grid size-32 place-items-center rounded-full bg-gradient-to-tr from-brand via-french to-japanese text-4xl font-bold text-white shadow-2xl shadow-brand/20">
              MSA
            </div>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Mohammad Saduddin Atahar</h2>
            <p className="mt-2 text-sm font-semibold uppercase tracking-wider text-brand">Founder & CEO</p>
            <p className="mt-6 leading-relaxed text-muted-foreground">
              Mohammad founded Master Lingo with a simple belief: everyone deserves a patient, intelligent tutor in their
              pocket. With a background in product thinking and a passion for languages, he leads the vision, design,
              and learner experience at Master Lingo.
            </p>
            <p className="mt-4 leading-relaxed text-muted-foreground">
              His goal is to make the platform feel less like an app and more like a mentor — one that celebrates your
              first words and guides you all the way to professional fluency.
            </p>
            <div className="mt-6 rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground backdrop-blur">
              <p className="font-semibold text-foreground">Master Lingo Headquarters</p>
              <p className="mt-1">Maharajganj, Uttar Pradesh, India</p>
              <p>PIN 273303</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">What we stand for</h2>
        <p className="mt-3 text-muted-foreground">The principles behind every lesson, feature, and interaction.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {VALUES.map((v, i) => (
          <motion.div
            key={v.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass-panel rounded-3xl p-8 shadow-lg"
          >
            <div className="grid size-11 place-items-center rounded-xl bg-brand-soft text-brand">
              <v.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-lg font-bold">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{v.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
      <div className="glass-panel rounded-4xl p-8 text-center shadow-2xl md:p-16">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Start your language journey today</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Join thousands of learners who are already mastering new languages with Master Lingo.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg" className="rounded-full bg-brand px-8 py-6 text-base font-semibold text-brand-foreground shadow-2xl shadow-brand/25 hover:bg-brand/90">
            <Link to="/auth" search={{ mode: "signup" }}>
              Start learning free <ArrowRight className="ml-1 size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full border-border bg-background/60 px-8 py-6 text-base font-semibold backdrop-blur">
            <Link to="/help">Contact us</Link>
          </Button>
        </div>
      </div>
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
            <span className="font-display text-lg font-bold">Master Lingo</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Premium AI-powered language learning. Master French, German & Japanese.
          </p>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Languages</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="/" className="text-muted-foreground hover:text-french">French</a></li>
            <li><a href="/" className="text-muted-foreground hover:text-german-ink">German</a></li>
            <li><a href="/" className="text-muted-foreground hover:text-japanese">Japanese</a></li>
            <li><a href="/" className="text-muted-foreground hover:text-english">English</a></li>
            <li><a href="/" className="text-muted-foreground hover:text-hindi-ink">English (Hindi speakers)</a></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/about" className="hover:text-foreground">About us</Link></li>
            <li><a href="/#faq" className="hover:text-foreground">FAQ</a></li>
            <li><a href="/#pricing" className="hover:text-foreground">Pricing</a></li>
            <li><Link to="/help" className="hover:text-foreground">Contact us</Link></li>
          </ul>
        </div>
      </div>
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-3 border-t border-border px-4 pt-6 text-xs text-muted-foreground sm:flex-row sm:px-6">
        <span>© {new Date().getFullYear()} Master Lingo</span>
        <span>Made for learners worldwide</span>
      </div>
    </footer>
  );
}
