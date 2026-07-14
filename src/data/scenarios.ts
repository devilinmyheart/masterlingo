// Conversation practice scenarios per language track.
// Each scenario is a short roleplay used by the Conversations feature.

export type ScenarioLevel = "A1" | "A2" | "B1" | "B2" | "C1";
export type ScenarioTrack = "french" | "german" | "japanese" | "english" | "hindi_english";

export type Scenario = {
  id: string;
  track: ScenarioTrack;
  level: ScenarioLevel;
  title: string;
  emoji: string;
  setting: string; // one-line description shown on the card
  role: string; // the AI's role, e.g. "friendly barista"
  goal: string; // what the learner should accomplish
  opening: string; // AI's first line in the target language
  openingTranslation: string; // English (or Hindi for hindi_english) meaning
};

const FR: Scenario[] = [
  {
    id: "fr-cafe-order",
    track: "french",
    level: "A1",
    title: "Order at a Parisian café",
    emoji: "☕",
    setting: "A cosy café near the Louvre. You want a coffee and a pastry.",
    role: "friendly Parisian barista",
    goal: "Greet, order a drink and a pastry, ask the price, pay.",
    opening: "Bonjour ! Bienvenue au café. Qu'est-ce que je vous sers aujourd'hui ?",
    openingTranslation: "Hello! Welcome to the café. What can I get you today?",
  },
  {
    id: "fr-directions",
    track: "french",
    level: "A2",
    title: "Ask for directions",
    emoji: "🗺️",
    setting: "You're lost in Lyon and need to reach the train station.",
    role: "helpful passerby",
    goal: "Ask politely, understand landmarks, thank the person.",
    opening: "Vous avez l'air perdu·e ! Je peux vous aider ?",
    openingTranslation: "You look lost! Can I help you?",
  },
  {
    id: "fr-interview",
    track: "french",
    level: "B1",
    title: "Junior developer interview",
    emoji: "💼",
    setting: "First interview for a junior dev role at a French startup.",
    role: "friendly hiring manager",
    goal: "Introduce yourself, talk about your skills and motivation.",
    opening: "Bonjour, merci d'être venu·e. Pouvez-vous vous présenter en quelques mots ?",
    openingTranslation: "Hello, thanks for coming. Can you introduce yourself briefly?",
  },
  {
    id: "fr-debate",
    track: "french",
    level: "B2",
    title: "Debate: remote work",
    emoji: "💬",
    setting: "Casual debate with a colleague about remote vs office work.",
    role: "opinionated colleague who prefers the office",
    goal: "Defend your view, use connectors, disagree politely.",
    opening: "Franchement, le télétravail tue la créativité d'équipe. Tu n'es pas d'accord ?",
    openingTranslation: "Honestly, remote work kills team creativity. Don't you agree?",
  },
];

const DE: Scenario[] = [
  {
    id: "de-bakery",
    track: "german",
    level: "A1",
    title: "At the Bäckerei",
    emoji: "🥨",
    setting: "A Berlin bakery in the morning.",
    role: "cheerful baker",
    goal: "Order bread and a pretzel, ask the total, pay.",
    opening: "Guten Morgen! Was darf's sein?",
    openingTranslation: "Good morning! What would you like?",
  },
  {
    id: "de-doctor",
    track: "german",
    level: "A2",
    title: "Doctor's appointment",
    emoji: "🩺",
    setting: "You have a cold and see a Hausarzt.",
    role: "patient family doctor",
    goal: "Describe symptoms, understand advice, thank the doctor.",
    opening: "Grüß Gott! Was fehlt Ihnen denn heute?",
    openingTranslation: "Hello! What seems to be the problem today?",
  },
  {
    id: "de-flat-viewing",
    track: "german",
    level: "B1",
    title: "Flat viewing in Munich",
    emoji: "🏠",
    setting: "Viewing a shared WG room.",
    role: "friendly future flatmate",
    goal: "Ask about rent, rules, and your future flatmate.",
    opening: "Hallo, schön dass du da bist! Willst du dir das Zimmer erst mal anschauen?",
    openingTranslation: "Hi, nice that you came! Do you want to look at the room first?",
  },
  {
    id: "de-debate-climate",
    track: "german",
    level: "B2",
    title: "Climate policy debate",
    emoji: "🌍",
    setting: "Coffee-break debate about climate policy.",
    role: "sceptical colleague",
    goal: "Argue clearly, use connectors, stay respectful.",
    opening: "Ich finde, die neue Klimapolitik geht viel zu weit. Wie siehst du das?",
    openingTranslation: "I think the new climate policy goes way too far. What do you think?",
  },
];

const JA: Scenario[] = [
  {
    id: "ja-conbini",
    track: "japanese",
    level: "A1",
    title: "At the convenience store",
    emoji: "🍙",
    setting: "You want an onigiri and a bottle of tea at a コンビニ.",
    role: "polite convenience store clerk",
    goal: "Greet, order, pay, use お願いします and ありがとう.",
    opening: "いらっしゃいませ！ ご注文はお決まりですか？ (Irasshaimase! Gochūmon wa okimari desu ka?)",
    openingTranslation: "Welcome! Have you decided on your order?",
  },
  {
    id: "ja-station",
    track: "japanese",
    level: "A2",
    title: "Ask for the right train",
    emoji: "🚉",
    setting: "You need to get to Shibuya from Tokyo Station.",
    role: "helpful station attendant",
    goal: "Ask which line, confirm the platform, thank them.",
    opening: "はい、どちらまで行かれますか？ (Hai, dochira made ikaremasu ka?)",
    openingTranslation: "Yes, where are you heading to?",
  },
  {
    id: "ja-restaurant",
    track: "japanese",
    level: "B1",
    title: "Dinner at an izakaya",
    emoji: "🍶",
    setting: "You're at a lively izakaya with friends.",
    role: "friendly izakaya staff",
    goal: "Order drinks and food, ask about recommendations.",
    opening: "いらっしゃいませ！ お飲み物は何にしましょうか？ (Nomimono wa nani ni shimashō ka?)",
    openingTranslation: "Welcome! What would you like to drink?",
  },
];

const EN: Scenario[] = [
  {
    id: "en-coffee",
    track: "english",
    level: "A1",
    title: "Order at a coffee shop",
    emoji: "☕",
    setting: "You're at a coffee shop in the morning.",
    role: "friendly barista",
    goal: "Greet, order, ask the price, pay.",
    opening: "Hi there! What can I get started for you today?",
    openingTranslation: "A friendly barista is asking what you'd like to order.",
  },
  {
    id: "en-introduce",
    track: "english",
    level: "A2",
    title: "Introduce yourself at a meetup",
    emoji: "👋",
    setting: "First time at a professional meetup.",
    role: "friendly attendee",
    goal: "Say your name, job, what you're working on, ask a question back.",
    opening: "Hey, I don't think we've met yet — I'm Alex. What brings you to the meetup?",
    openingTranslation: "Someone is introducing themselves and inviting you to share too.",
  },
  {
    id: "en-interview",
    track: "english",
    level: "B1",
    title: "Job interview: tell me about yourself",
    emoji: "💼",
    setting: "Video interview for a role you really want.",
    role: "warm but professional hiring manager",
    goal: "Give a 60-second self-intro covering background, strengths, and why this role.",
    opening: "Thanks for making time today. To kick things off — tell me a bit about yourself.",
    openingTranslation: "The interviewer wants a short professional self-introduction.",
  },
  {
    id: "en-disagree",
    track: "english",
    level: "B2",
    title: "Disagree politely in a meeting",
    emoji: "🗣️",
    setting: "A team meeting where the plan seems risky.",
    role: "confident teammate proposing the risky plan",
    goal: "Push back respectfully, propose an alternative, keep it professional.",
    opening: "So I really think we should just ship the redesign this Friday. What do you all think?",
    openingTranslation: "A teammate is proposing a rushed launch — respond and push back.",
  },
];

const HI: Scenario[] = [
  {
    id: "hi-coffee",
    track: "hindi_english",
    level: "A1",
    title: "Order coffee in English",
    emoji: "☕",
    setting: "आप एक कैफ़े में हैं और अंग्रेज़ी में ऑर्डर करना है।",
    role: "friendly barista",
    goal: "अंग्रेज़ी में नमस्ते कहें, ऑर्डर दें, कीमत पूछें।",
    opening: "Hi there! What can I get you today?",
    openingTranslation: "बरिस्ता पूछ रहा है — आज आप क्या लेना चाहेंगे?",
  },
  {
    id: "hi-office",
    track: "hindi_english",
    level: "A2",
    title: "Office par introduction",
    emoji: "🏢",
    setting: "पहला दिन नए ऑफिस में — teammate से मिलिए।",
    role: "friendly new coworker",
    goal: "अपना नाम, role और पिछला काम अंग्रेज़ी में बताइए।",
    opening: "Hey, welcome to the team! I don't think we've met — what team are you on?",
    openingTranslation: "नया सहकर्मी आपका स्वागत कर रहा है और team पूछ रहा है।",
  },
  {
    id: "hi-doctor",
    track: "hindi_english",
    level: "A2",
    title: "Doctor को symptoms बताइए",
    emoji: "🩺",
    setting: "अंग्रेज़ी बोलने वाले doctor के पास appointment।",
    role: "patient family doctor",
    goal: "बुखार / सर दर्द जैसे symptoms अंग्रेज़ी में बताइए।",
    opening: "Hi, please have a seat. So — what's been going on?",
    openingTranslation: "डॉक्टर पूछ रहे हैं कि आपको क्या तकलीफ़ है।",
  },
  {
    id: "hi-interview",
    track: "hindi_english",
    level: "B1",
    title: "IT interview में self-intro",
    emoji: "💼",
    setting: "एक MNC में technical interview।",
    role: "warm hiring manager",
    goal: "अपना background, projects, और strengths अंग्रेज़ी में बताइए।",
    opening: "Thanks for joining today. Could you start with a quick introduction about yourself?",
    openingTranslation: "Interviewer एक छोटा-सा self-introduction माँग रहा है।",
  },
];

export const ALL_SCENARIOS: Scenario[] = [...FR, ...DE, ...JA, ...EN, ...HI];

export function scenariosForTrack(track: ScenarioTrack): Scenario[] {
  return ALL_SCENARIOS.filter((s) => s.track === track);
}

export function findScenario(id: string): Scenario | undefined {
  return ALL_SCENARIOS.find((s) => s.id === id);
}
