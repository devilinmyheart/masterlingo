import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { HelpCircle, Mail, MessageSquare, Clock, CheckCircle2, Send, Instagram, Twitter } from "lucide-react";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({
    meta: [
      { title: "Help & Contact — Master Lingo" },
      { name: "description", content: "Get help with Master Lingo. Contact our support team or browse frequently asked questions." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/help" }],
  }),
  component: HelpPage,
});

const FAQS = [
  {
    q: "How do I change my learning language?",
    a: "Go to your Profile page and update your active language. Your progress is saved separately for each language, so you can switch anytime without losing progress.",
  },
  {
    q: "Can I learn more than one language at a time?",
    a: "Yes. You can switch between French, German, Japanese, English, and English for Hindi speakers from your Profile. We recommend focusing on one language at a time for the best results.",
  },
  {
    q: "What are hearts and how do I get more?",
    a: "Hearts represent your daily mistakes budget. You start each day with a full set and earn more by completing lessons or waiting for the next daily reset.",
  },
  {
    q: "How does the AI Tutor work?",
    a: "The AI Tutor is a conversational practice partner. Ask grammar questions, request translations, or practice speaking. It adapts to the language you are currently learning.",
  },
  {
    q: "Is my progress saved across devices?",
    a: "Yes. As long as you are signed in to the same account, your progress, streak, and vocabulary sync automatically across all your devices.",
  },
];

const SUBJECTS = [
  { value: "general", label: "General question" },
  { value: "billing", label: "Billing & subscriptions" },
  { value: "bug", label: "Bug report" },
  { value: "feature", label: "Feature request" },
  { value: "language", label: "Language content" },
  { value: "account", label: "Account issue" },
];

function HelpPage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const { data: userData } = useQuery({
    queryKey: ["user-email-name"],
    queryFn: async () => {
      const { data: authData } = await supabase.auth.getUser();
      const { data: profileData } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", authData.user?.id ?? "")
        .single();
      return {
        name: profileData?.display_name ?? authData.user?.user_metadata?.full_name ?? "",
        email: authData.user?.email ?? "",
      };
    },
  });

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setEmail(userData.email);
    }
  }, [userData]);

  const { data: submissions } = useQuery({
    queryKey: ["contact-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contact_submissions")
        .select("id, subject, message, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async (values: { subject: string; name: string; email: string; message: string }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Not signed in");
      const { error } = await supabase.from("contact_submissions").insert({
        user_id: userData.user.id,
        name: values.name,
        email: values.email,
        subject: values.subject,
        message: values.message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Message sent. We will get back to you soon.");
      setMessage("");
      setSubject("general");
      qc.invalidateQueries({ queryKey: ["contact-submissions"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to send message");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    submit.mutate({
      subject: SUBJECTS.find((s) => s.value === subject)?.label ?? subject,
      name,
      email,
      message,
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 md:py-12">
      <div className="mb-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
          <HelpCircle className="size-3.5" /> Help Center
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold md:text-4xl">How can we help you?</h1>
        <p className="mt-2 text-muted-foreground">
          Browse answers below or send us a message. Our team typically replies within 24 hours.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-8">
          <Card className="glass-panel border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-xl">
                <MessageSquare className="size-5 text-brand" /> Contact us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="flex h-10 w-full rounded-xl border border-input bg-background/50 px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us what you need help with..."
                    rows={5}
                    className="rounded-xl bg-background/50"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submit.isPending}
                  className="rounded-full bg-brand px-6 text-brand-foreground hover:bg-brand/90"
                >
                  {submit.isPending ? (
                    "Sending…"
                  ) : (
                    <>
                      <Send className="mr-2 size-4" /> Send message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {submissions && submissions.length > 0 && (
            <Card className="glass-panel border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="font-display text-xl">Your recent messages</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {submissions.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{item.subject}</div>
                        <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.message}</div>
                      </div>
                      <div className="shrink-0">
                        {item.status === "open" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600">
                            <Clock className="size-3" /> Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600">
                            <CheckCircle2 className="size-3" /> Resolved
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      {new Date(item.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="glass-panel border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-xl">Frequently asked questions</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, i) => (
                  <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
                    <AccordionTrigger className="text-left text-sm font-medium hover:no-underline">
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">{faq.a}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card className="glass-panel border-border/60 bg-gradient-to-br from-brand/10 to-transparent shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-brand text-brand-foreground">
                  <Mail className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">Email us</div>
                  <a
                    href="mailto:support@masterlingo.lovable.app"
                    className="text-sm text-muted-foreground hover:text-brand"
                  >
                    support@masterlingo.lovable.app
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg">Connect with us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <a
                  href="https://twitter.com/lingomaster"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Twitter className="size-4" /> Twitter / X
                </a>
                <a
                  href="https://instagram.com/lingomaster"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Instagram className="size-4" /> Instagram
                </a>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="font-display text-lg">Response times</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>General questions</span>
                <span className="font-medium text-foreground">Within 24 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Billing issues</span>
                <span className="font-medium text-foreground">Within 12 hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Bug reports</span>
                <span className="font-medium text-foreground">Within 48 hours</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
