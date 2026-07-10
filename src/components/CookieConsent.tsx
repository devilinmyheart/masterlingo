import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

const CONSENT_KEY = "masterlingo-cookie-consent";

type ConsentState = "pending" | "accepted" | "declined";

export function CookieConsent() {
  const [status, setStatus] = useState<ConsentState>("pending");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(CONSENT_KEY) : null;
    if (stored === "accepted" || stored === "declined") {
      setStatus(stored);
    }
  }, []);

  const handleAccept = () => {
    setStatus("accepted");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSENT_KEY, "accepted");
    }
  };

  const handleDecline = () => {
    setStatus("declined");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CONSENT_KEY, "declined");
    }
  };

  if (!mounted || status !== "pending") return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-[100] mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="glass-panel rounded-2xl border border-border bg-background/80 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
        <div className="flex items-start gap-3">
          <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10">
            <Cookie className="size-5 text-brand" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-foreground">We use cookies</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Master Lingo uses cookies and similar technologies to serve personalized ads, analyze traffic, and improve your learning experience. By clicking "Accept", you agree to our use of cookies for advertising purposes.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                onClick={handleAccept}
                className="rounded-full bg-brand px-4 text-brand-foreground hover:opacity-90"
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDecline}
                className="rounded-full px-4"
              >
                Decline
              </Button>
            </div>
          </div>
          <button
            onClick={handleDecline}
            aria-label="Close cookie banner"
            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
