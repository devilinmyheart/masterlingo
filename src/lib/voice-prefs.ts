import { useEffect, useState } from "react";

/**
 * Per-language voice/TTS preferences persisted in localStorage.
 * English and Hindi-for-English are configured separately:
 *  - english: single voice (target = English)
 *  - hindi_english: two voices — target (English word) + gloss (Hindi translation)
 */

export type VoiceSlot = {
  /** BCP-47 language tag, e.g. "en-US", "en-GB", "en-IN", "hi-IN" */
  lang: string;
  /** Preferred SpeechSynthesisVoice.voiceURI (empty = auto by lang) */
  voiceURI: string;
  /** 0.5 – 1.5 */
  rate: number;
  /** 0.5 – 1.5 */
  pitch: number;
};

export type VoicePrefs = {
  english: VoiceSlot;
  /** Hindi-for-English track — English word + Hindi translation voice */
  hindi_english: { target: VoiceSlot; gloss: VoiceSlot };
};

const KEY = "lingomaster.voice-prefs.v1";

export const DEFAULT_PREFS: VoicePrefs = {
  english: { lang: "en-US", voiceURI: "", rate: 1, pitch: 1 },
  hindi_english: {
    target: { lang: "en-US", voiceURI: "", rate: 0.95, pitch: 1 },
    gloss: { lang: "hi-IN", voiceURI: "", rate: 0.95, pitch: 1 },
  },
};

export const ENGLISH_ACCENTS = [
  { code: "en-US", label: "American English (en-US)" },
  { code: "en-GB", label: "British English (en-GB)" },
  { code: "en-AU", label: "Australian English (en-AU)" },
  { code: "en-IN", label: "Indian English (en-IN)" },
  { code: "en-CA", label: "Canadian English (en-CA)" },
];

export const HINDI_ACCENTS = [{ code: "hi-IN", label: "Hindi (hi-IN)" }];

export function loadVoicePrefs(): VoicePrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<VoicePrefs>;
    return {
      english: { ...DEFAULT_PREFS.english, ...(parsed.english ?? {}) },
      hindi_english: {
        target: { ...DEFAULT_PREFS.hindi_english.target, ...(parsed.hindi_english?.target ?? {}) },
        gloss: { ...DEFAULT_PREFS.hindi_english.gloss, ...(parsed.hindi_english?.gloss ?? {}) },
      },
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveVoicePrefs(next: VoicePrefs) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("lingomaster:voice-prefs"));
}

export function useVoicePrefs() {
  const [prefs, setPrefs] = useState<VoicePrefs>(DEFAULT_PREFS);
  useEffect(() => {
    setPrefs(loadVoicePrefs());
    const sync = () => setPrefs(loadVoicePrefs());
    window.addEventListener("lingomaster:voice-prefs", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("lingomaster:voice-prefs", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  const update = (next: VoicePrefs) => {
    setPrefs(next);
    saveVoicePrefs(next);
  };
  return [prefs, update] as const;
}

/** Return SpeechSynthesisVoices, refreshing as browsers load them async. */
export function useSpeechVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const sync = () => setVoices(window.speechSynthesis.getVoices());
    sync();
    window.speechSynthesis.addEventListener?.("voiceschanged", sync);
    return () => window.speechSynthesis.removeEventListener?.("voiceschanged", sync);
  }, []);
  return voices;
}

/** Speak text using the given VoiceSlot (auto no-op on SSR / unsupported). */
export function speakWithSlot(text: string, slot: VoiceSlot) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = slot.lang;
  u.rate = slot.rate;
  u.pitch = slot.pitch;
  if (slot.voiceURI) {
    const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === slot.voiceURI);
    if (voice) u.voice = voice;
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}
