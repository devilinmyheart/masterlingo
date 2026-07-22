// Animated icon mapping. Keyed by the English translation of a vocabulary word
// so all languages share one visual (café / Kaffee / coffee -> ☕).
// Motion preset drives how framer-motion animates the emoji.

export type MotionPreset =
  | "bounce"
  | "wiggle"
  | "float"
  | "spin"
  | "pulse"
  | "steam"
  | "wave";

export type IconSpec = { emoji: string; motion: MotionPreset };

// Normalize a translation string for lookup: lowercase, strip parentheticals,
// take the primary sense before commas/slashes, trim articles.
export function normalizeKey(translation: string): string {
  return translation
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .split(/[,/;]/)[0]
    .replace(/^(the|a|an|to)\s+/i, "")
    .trim();
}

const ICONS: Record<string, IconSpec> = {
  // Greetings & social
  hello: { emoji: "👋", motion: "wave" },
  hi: { emoji: "👋", motion: "wave" },
  "good morning": { emoji: "🌅", motion: "float" },
  "good evening": { emoji: "🌆", motion: "float" },
  "good night": { emoji: "🌙", motion: "float" },
  goodbye: { emoji: "👋", motion: "wave" },
  bye: { emoji: "👋", motion: "wave" },
  "thank you": { emoji: "🙏", motion: "pulse" },
  thanks: { emoji: "🙏", motion: "pulse" },
  please: { emoji: "🙏", motion: "pulse" },
  sorry: { emoji: "😔", motion: "wiggle" },
  yes: { emoji: "✅", motion: "bounce" },
  no: { emoji: "❌", motion: "wiggle" },

  // Food & drink
  coffee: { emoji: "☕", motion: "steam" },
  tea: { emoji: "🍵", motion: "steam" },
  water: { emoji: "💧", motion: "bounce" },
  milk: { emoji: "🥛", motion: "float" },
  juice: { emoji: "🧃", motion: "float" },
  wine: { emoji: "🍷", motion: "float" },
  beer: { emoji: "🍺", motion: "float" },
  bread: { emoji: "🍞", motion: "bounce" },
  croissant: { emoji: "🥐", motion: "float" },
  cheese: { emoji: "🧀", motion: "bounce" },
  apple: { emoji: "🍎", motion: "bounce" },
  banana: { emoji: "🍌", motion: "wiggle" },
  orange: { emoji: "🍊", motion: "bounce" },
  rice: { emoji: "🍚", motion: "steam" },
  fish: { emoji: "🐟", motion: "wiggle" },
  meat: { emoji: "🥩", motion: "pulse" },
  egg: { emoji: "🥚", motion: "bounce" },
  chicken: { emoji: "🍗", motion: "pulse" },
  sushi: { emoji: "🍣", motion: "float" },
  ramen: { emoji: "🍜", motion: "steam" },
  pizza: { emoji: "🍕", motion: "spin" },
  cake: { emoji: "🍰", motion: "float" },
  chocolate: { emoji: "🍫", motion: "float" },
  food: { emoji: "🍽️", motion: "pulse" },
  breakfast: { emoji: "🍳", motion: "pulse" },
  lunch: { emoji: "🥪", motion: "pulse" },
  dinner: { emoji: "🍽️", motion: "pulse" },

  // Nature & weather
  sun: { emoji: "☀️", motion: "spin" },
  moon: { emoji: "🌙", motion: "float" },
  star: { emoji: "⭐", motion: "spin" },
  rain: { emoji: "🌧️", motion: "float" },
  snow: { emoji: "❄️", motion: "spin" },
  cloud: { emoji: "☁️", motion: "float" },
  wind: { emoji: "🌬️", motion: "wiggle" },
  fire: { emoji: "🔥", motion: "pulse" },
  tree: { emoji: "🌳", motion: "wiggle" },
  flower: { emoji: "🌸", motion: "spin" },
  mountain: { emoji: "⛰️", motion: "float" },
  sea: { emoji: "🌊", motion: "wave" },
  ocean: { emoji: "🌊", motion: "wave" },
  beach: { emoji: "🏖️", motion: "float" },

  // Animals
  dog: { emoji: "🐶", motion: "bounce" },
  cat: { emoji: "🐱", motion: "bounce" },
  bird: { emoji: "🐦", motion: "float" },
  horse: { emoji: "🐴", motion: "bounce" },
  cow: { emoji: "🐮", motion: "pulse" },
  pig: { emoji: "🐷", motion: "wiggle" },
  rabbit: { emoji: "🐰", motion: "bounce" },
  mouse: { emoji: "🐭", motion: "bounce" },
  elephant: { emoji: "🐘", motion: "pulse" },
  lion: { emoji: "🦁", motion: "pulse" },
  bear: { emoji: "🐻", motion: "pulse" },
  monkey: { emoji: "🐵", motion: "wiggle" },

  // People & family
  friend: { emoji: "🤝", motion: "pulse" },
  family: { emoji: "👨‍👩‍👧", motion: "pulse" },
  mother: { emoji: "👩", motion: "pulse" },
  mom: { emoji: "👩", motion: "pulse" },
  father: { emoji: "👨", motion: "pulse" },
  dad: { emoji: "👨", motion: "pulse" },
  child: { emoji: "🧒", motion: "bounce" },
  baby: { emoji: "👶", motion: "bounce" },
  boy: { emoji: "👦", motion: "bounce" },
  girl: { emoji: "👧", motion: "bounce" },
  man: { emoji: "🧑", motion: "pulse" },
  woman: { emoji: "👩", motion: "pulse" },
  teacher: { emoji: "🧑‍🏫", motion: "pulse" },
  student: { emoji: "🎓", motion: "float" },

  // Places & things
  house: { emoji: "🏠", motion: "float" },
  home: { emoji: "🏠", motion: "float" },
  school: { emoji: "🏫", motion: "float" },
  car: { emoji: "🚗", motion: "wiggle" },
  train: { emoji: "🚆", motion: "wiggle" },
  bus: { emoji: "🚌", motion: "wiggle" },
  plane: { emoji: "✈️", motion: "float" },
  bike: { emoji: "🚲", motion: "spin" },
  book: { emoji: "📖", motion: "float" },
  phone: { emoji: "📱", motion: "wiggle" },
  computer: { emoji: "💻", motion: "pulse" },
  money: { emoji: "💰", motion: "bounce" },
  key: { emoji: "🔑", motion: "spin" },
  door: { emoji: "🚪", motion: "float" },
  bed: { emoji: "🛏️", motion: "float" },
  chair: { emoji: "🪑", motion: "float" },
  table: { emoji: "🍽️", motion: "float" },
  clock: { emoji: "🕐", motion: "spin" },

  // Feelings
  love: { emoji: "❤️", motion: "pulse" },
  happy: { emoji: "😊", motion: "bounce" },
  sad: { emoji: "😢", motion: "float" },
  angry: { emoji: "😠", motion: "wiggle" },
  tired: { emoji: "😴", motion: "float" },

  // Body
  eye: { emoji: "👁️", motion: "pulse" },
  hand: { emoji: "✋", motion: "wave" },
  heart: { emoji: "❤️", motion: "pulse" },

  // Colors — small palette dot
  red: { emoji: "🔴", motion: "pulse" },
  blue: { emoji: "🔵", motion: "pulse" },
  green: { emoji: "🟢", motion: "pulse" },
  yellow: { emoji: "🟡", motion: "pulse" },
  black: { emoji: "⚫", motion: "pulse" },
  white: { emoji: "⚪", motion: "pulse" },

  // Time
  today: { emoji: "📅", motion: "float" },
  tomorrow: { emoji: "📆", motion: "float" },
  yesterday: { emoji: "🗓️", motion: "float" },
  morning: { emoji: "🌅", motion: "float" },
  night: { emoji: "🌙", motion: "float" },

  // Common actions
  eat: { emoji: "🍴", motion: "bounce" },
  drink: { emoji: "🥤", motion: "float" },
  sleep: { emoji: "😴", motion: "float" },
  run: { emoji: "🏃", motion: "wiggle" },
  walk: { emoji: "🚶", motion: "wiggle" },
  read: { emoji: "📖", motion: "float" },
  write: { emoji: "✍️", motion: "wiggle" },
  speak: { emoji: "🗣️", motion: "pulse" },
  listen: { emoji: "👂", motion: "pulse" },
  learn: { emoji: "🎓", motion: "bounce" },
};

// Try progressively looser lookups so translations like "Hello (formal)",
// "to eat", "the coffee" still resolve.
export function getAnimationFor(translation: string): IconSpec | null {
  if (!translation) return null;
  const key = normalizeKey(translation);
  if (ICONS[key]) return ICONS[key];
  // fall back to first matching whole word
  for (const word of key.split(/\s+/)) {
    if (ICONS[word]) return ICONS[word];
  }
  return null;
}

// Category icons for the lesson-path nodes on /learn.
export function categoryIconFor(topicId: string): IconSpec {
  if (/-review$/.test(topicId)) return { emoji: "🏆", motion: "bounce" };
  if (/alphabet|hiragana|katakana|hangul|pron/i.test(topicId)) return { emoji: "🔤", motion: "wiggle" };
  if (/number|counting|time/i.test(topicId)) return { emoji: "🔢", motion: "spin" };
  if (/greeting|small.?talk|introduc/i.test(topicId)) return { emoji: "👋", motion: "wave" };
  if (/grammar|articles|verbs|tense|conjug/i.test(topicId)) return { emoji: "⚙️", motion: "spin" };
  if (/food|drink|kitchen/i.test(topicId)) return { emoji: "🍽️", motion: "bounce" };
  if (/family|people/i.test(topicId)) return { emoji: "👪", motion: "pulse" };
  if (/travel|direction/i.test(topicId)) return { emoji: "🧭", motion: "spin" };
  if (/daily|conversation|phrase/i.test(topicId)) return { emoji: "💬", motion: "pulse" };
  if (/kanji|writing/i.test(topicId)) return { emoji: "🖋️", motion: "wiggle" };
  return { emoji: "📚", motion: "float" };
}
