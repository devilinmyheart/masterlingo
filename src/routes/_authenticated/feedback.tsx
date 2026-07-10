import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";
import { Star, Send, Loader2, MessageSquareHeart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback & Rating — LingoMaster" },
      { name: "description", content: "Rate LingoMaster and share feedback to help us improve your learning experience." },
      { name: "robots", content: "noindex" },
    ],
    links: [{ rel: "canonical", href: "https://masterlingo.lovable.app/feedback" }],
  }),
  component: FeedbackPage,
});

const CATEGORIES = [
  { value: "general", label: "Overall experience" },
  { value: "lessons", label: "Lessons & curriculum" },
  { value: "tutor", label: "AI Tutor" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "ui", label: "Design & UI" },
  { value: "performance", label: "Speed & performance" },
] as const;

const feedbackSchema = z.object({
  rating: z.number().int().min(1, "Please choose a rating").max(5),
  category: z.string().min(1),
  message: z.string().trim().max(1000, "Keep it under 1000 characters").optional(),
});

function FeedbackPage() {
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [category, setCategory] = useState<string>("general");
  const [message, setMessage] = useState("");

  const { data: history } = useQuery({
    queryKey: ["feedback-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feedback_submissions")
        .select("id, rating, category, message, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      const parsed = feedbackSchema.safeParse({ rating, category, message: message.trim() || undefined });
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("feedback_submissions").insert({
        user_id: user.id,
        rating: parsed.data.rating,
        category: parsed.data.category,
        message: parsed.data.message ?? null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Thanks for the feedback! 💛");
      setRating(0);
      setMessage("");
      setCategory("general");
      qc.invalidateQueries({ queryKey: ["feedback-history"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Could not submit"),
  });

  const label =
    hover || rating
      ? ["", "Needs work", "Could be better", "It's okay", "Really good", "Love it!"][hover || rating]
      : "Tap a star to rate";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 flex items-start gap-4"
      >
        <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-brand to-french text-white shadow-lg shadow-brand/20">
          <MessageSquareHeart className="size-6" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Rate LingoMaster</h1>
          <p className="mt-1 text-muted-foreground">Your honest feedback shapes what we build next.</p>
        </div>
      </motion.div>

      <Card className="glass-panel border-border/60 shadow-xl">
        <CardHeader>
          <CardTitle className="text-lg">How was your experience?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Star rating */}
          <div>
            <div className="flex items-center justify-center gap-2" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || rating) >= n;
                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`Rate ${n} star${n === 1 ? "" : "s"}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                    className="rounded-full p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-brand/40"
                  >
                    <Star
                      className={cn(
                        "size-10 transition-colors",
                        active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                      )}
                    />
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-center text-sm font-medium text-muted-foreground">{label}</p>
          </div>

          {/* Category */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">What is this about?</Label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    category === c.value
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border bg-background hover:border-brand/40"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="feedback-message" className="mb-2 block text-sm font-semibold">
              Tell us more <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              placeholder="What worked? What didn't? Anything you'd love to see?"
              rows={5}
              className="resize-none"
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">{message.length}/1000</div>
          </div>

          <Button
            onClick={() => submit.mutate()}
            disabled={submit.isPending || rating === 0}
            className="w-full gap-2 rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
            size="lg"
          >
            {submit.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Submit feedback
          </Button>
        </CardContent>
      </Card>

      {/* History */}
      {history && history.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-display text-xl font-bold">Your recent feedback</h2>
          <div className="space-y-3">
            {history.map((h) => (
              <Card key={h.id} className="border-border/60">
                <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star
                            key={n}
                            className={cn(
                              "size-4",
                              n <= h.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {CATEGORIES.find((c) => c.value === h.category)?.label ?? h.category}
                      </span>
                    </div>
                    {h.message && <p className="mt-2 text-sm text-foreground/90">{h.message}</p>}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {new Date(h.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
