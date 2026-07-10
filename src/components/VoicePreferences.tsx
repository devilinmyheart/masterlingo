import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Volume2 } from "lucide-react";
import {
  ENGLISH_ACCENTS,
  HINDI_ACCENTS,
  speakWithSlot,
  useSpeechVoices,
  useVoicePrefs,
  type VoiceSlot,
} from "@/lib/voice-prefs";

const EN_SAMPLE = "Hello, welcome to LingoMaster. How are you today?";
const HI_SAMPLE = "नमस्ते! आज हम अंग्रेज़ी सीखेंगे।";

export function VoicePreferences() {
  const [prefs, setPrefs] = useVoicePrefs();
  const voices = useSpeechVoices();

  const voicesFor = (langPrefix: string) =>
    voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));

  function renderSlot(
    slot: VoiceSlot,
    onChange: (next: VoiceSlot) => void,
    opts: { accents: { code: string; label: string }[]; sample: string; label: string }
  ) {
    const available = voicesFor(slot.lang.split("-")[0]);
    return (
      <div className="rounded-2xl border border-border bg-background/60 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">{opts.label}</div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => speakWithSlot(opts.sample, slot)}
            className="h-8 gap-1.5 rounded-full text-xs"
          >
            <Volume2 className="size-3.5" /> Preview
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Accent</Label>
            <select
              value={slot.lang}
              onChange={(e) => onChange({ ...slot, lang: e.target.value, voiceURI: "" })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {opts.accents.map((a) => (
                <option key={a.code} value={a.code}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Voice</Label>
            <select
              value={slot.voiceURI}
              onChange={(e) => onChange({ ...slot, voiceURI: e.target.value })}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">System default</option>
              {available.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} {v.lang !== slot.lang ? `· ${v.lang}` : ""}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <Label>Speed</Label>
              <span className="tabular-nums text-muted-foreground">{slot.rate.toFixed(2)}×</span>
            </div>
            <Slider
              value={[slot.rate]}
              min={0.5}
              max={1.5}
              step={0.05}
              onValueChange={([v]) => onChange({ ...slot, rate: v })}
            />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <Label>Pitch</Label>
              <span className="tabular-nums text-muted-foreground">{slot.pitch.toFixed(2)}</span>
            </div>
            <Slider
              value={[slot.pitch]}
              min={0.5}
              max={1.5}
              step={0.05}
              onValueChange={([v]) => onChange({ ...slot, pitch: v })}
            />
          </div>
        </div>
        {available.length === 0 && (
          <p className="mt-3 text-xs text-muted-foreground">
            No installed voice matches this accent. Your device will fall back to its closest system voice.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🇬🇧</span>
          <h3 className="font-display text-lg font-semibold">English</h3>
        </div>
        {renderSlot(
          prefs.english,
          (next) => setPrefs({ ...prefs, english: next }),
          { accents: ENGLISH_ACCENTS, sample: EN_SAMPLE, label: "Spoken English voice" }
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="text-lg">🇮🇳</span>
          <h3 className="font-display text-lg font-semibold">Hindi → English</h3>
        </div>
        <div className="space-y-3">
          {renderSlot(
            prefs.hindi_english.target,
            (next) => setPrefs({ ...prefs, hindi_english: { ...prefs.hindi_english, target: next } }),
            { accents: ENGLISH_ACCENTS, sample: EN_SAMPLE, label: "English word voice (target)" }
          )}
          {renderSlot(
            prefs.hindi_english.gloss,
            (next) => setPrefs({ ...prefs, hindi_english: { ...prefs.hindi_english, gloss: next } }),
            { accents: HINDI_ACCENTS, sample: HI_SAMPLE, label: "Hindi translation voice (gloss)" }
          )}
        </div>
      </div>
    </div>
  );
}
