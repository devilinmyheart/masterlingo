// Full Master Lingo curriculum data. Kept as a static module so the router
// tree and dashboards can render without a network round-trip.

export type LanguageId = "french" | "german" | "japanese" | "english" | "hindi_english";

export interface Topic {
  id: string;
  title: string;
  description: string;
  minutes: number;
  xp: number;
}

export interface Level {
  id: string; // "a1" ... "c2"
  label: string; // "A1"
  headline: string;
  topics: Topic[];
}

export interface LanguageCourse {
  id: LanguageId;
  name: string;
  nativeName: string;
  tagline: string;
  flag: string;
  levels: Level[];
}

const CEFR = ["a1", "a2", "b1", "b2", "c1", "c2"] as const;

function makeLevels(
  prefix: string,
  perLevel: (label: string) => { headline: string; topics: Topic[] },
): Level[] {
  return CEFR.map((id) => {
    const label = id.toUpperCase();
    const { headline, topics } = perLevel(label);
    // Every level ends with a review quiz — the checkpoint after all lessons.
    const reviewTopic: Topic = {
      id: `${prefix}-${id}-review`,
      title: `${label} Review Quiz`,
      description: `Final checkpoint — quiz yourself on everything from ${label}.`,
      minutes: 8,
      xp: 100,
    };
    return { id, label, headline, topics: [...topics, reviewTopic] };
  });
}

export const CURRICULUM: Record<LanguageId, LanguageCourse> = {
  french: {
    id: "french",
    name: "French",
    nativeName: "Français",
    tagline: "The language of diplomacy, cuisine, and cinema.",
    flag: "🇫🇷",
    levels: makeLevels("fr", (label) => {
      switch (label) {
        case "A1":
          return {
            headline: "Foundations: alphabet, greetings, and everyday words.",
            topics: [
              { id: "fr-a1-alphabet", title: "Alphabet & Pronunciation", description: "Start here — vowels, nasal sounds, silent letters.", minutes: 12, xp: 50 },
              { id: "fr-a1-numbers", title: "Numbers 0–20", description: "Counting, prices, phone numbers.", minutes: 10, xp: 40 },
              { id: "fr-a1-greetings", title: "Greetings & Introductions", description: "Bonjour, comment ça va, se présenter.", minutes: 10, xp: 40 },
              { id: "fr-a1-family", title: "Family & People", description: "Ma mère, mon frère, describe your family.", minutes: 12, xp: 50 },
              { id: "fr-a1-colors", title: "Colors & Descriptions", description: "Adjective agreement with rouge, bleu, vert.", minutes: 10, xp: 40 },
              { id: "fr-a1-food", title: "Food & Ordering", description: "Café, boulangerie, restaurant basics.", minutes: 15, xp: 60 },
              { id: "fr-a1-travel", title: "Travel Essentials", description: "At the airport, hotel, and metro.", minutes: 15, xp: 60 },
              { id: "fr-a1-grammar", title: "Basic Grammar", description: "Articles, gender, present tense être & avoir.", minutes: 18, xp: 80 },
            ],
          };
        case "A2":
          return {
            headline: "Everyday communication and past-tense storytelling.",
            topics: [
              { id: "fr-a2-passe", title: "Passé composé", description: "Talk about what you did.", minutes: 20, xp: 90 },
              { id: "fr-a2-daily", title: "Daily Routine", description: "Se lever, se coucher — reflexive verbs.", minutes: 15, xp: 60 },
              { id: "fr-a2-shopping", title: "Shopping & Prices", description: "Bargain in a French market.", minutes: 12, xp: 50 },
              { id: "fr-a2-directions", title: "Directions in a City", description: "Tourner, tout droit, en face.", minutes: 12, xp: 50 },
              { id: "fr-a2-weather", title: "Weather & Seasons", description: "Il fait beau, il pleut.", minutes: 10, xp: 40 },
              { id: "fr-a2-verbs", title: "Common Irregular Verbs", description: "Aller, faire, prendre, vouloir.", minutes: 18, xp: 80 },
            ],
          };
        case "B1":
          return {
            headline: "Real conversations, opinions, and complex tenses.",
            topics: [
              { id: "fr-b1-imparfait", title: "Imparfait vs Passé composé", description: "Choose the right past tense.", minutes: 20, xp: 90 },
              { id: "fr-b1-future", title: "Future & Conditional", description: "Je ferais, je serai — plan and hypothesize.", minutes: 18, xp: 80 },
              { id: "fr-b1-opinion", title: "Giving Opinions", description: "À mon avis, je pense que…", minutes: 15, xp: 60 },
              { id: "fr-b1-news", title: "Reading the News", description: "Headlines and short articles.", minutes: 20, xp: 90 },
              { id: "fr-b1-work", title: "Work & Careers", description: "Interviews and CVs.", minutes: 18, xp: 80 },
            ],
          };
        case "B2":
          return {
            headline: "Fluent expression with nuance and idiom.",
            topics: [
              { id: "fr-b2-subj", title: "Subjunctive Mood", description: "Il faut que, bien que, pour que.", minutes: 22, xp: 100 },
              { id: "fr-b2-debate", title: "Debate & Argumentation", description: "Structure a French argument.", minutes: 20, xp: 90 },
              { id: "fr-b2-idioms", title: "Idiomatic Expressions", description: "Poser un lapin, avoir le cafard.", minutes: 15, xp: 70 },
              { id: "fr-b2-lit", title: "Short Literature", description: "Read Maupassant excerpts.", minutes: 22, xp: 100 },
            ],
          };
        case "C1":
          return {
            headline: "Sophisticated writing, culture, and register.",
            topics: [
              { id: "fr-c1-register", title: "Formal vs Familiar Register", description: "Match tone to setting.", minutes: 20, xp: 90 },
              { id: "fr-c1-essay", title: "Argumentative Essays", description: "Dissertation structure.", minutes: 25, xp: 110 },
              { id: "fr-c1-cinema", title: "French Cinema", description: "Truffaut, Varda, and modern films.", minutes: 22, xp: 100 },
            ],
          };
        default: // C2
          return {
            headline: "Near-native mastery and literary depth.",
            topics: [
              { id: "fr-c2-nuance", title: "Nuance & Subtext", description: "Read between the lines.", minutes: 25, xp: 110 },
              { id: "fr-c2-classics", title: "Classical Literature", description: "Camus, Proust, Beauvoir.", minutes: 30, xp: 130 },
              { id: "fr-c2-philosophy", title: "Philosophy in French", description: "Read Sartre in the original.", minutes: 30, xp: 130 },
            ],
          };
      }
    }),
  },

  german: {
    id: "german",
    name: "German",
    nativeName: "Deutsch",
    tagline: "Precision, philosophy, and Europe's engine room.",
    flag: "🇩🇪",
    levels: makeLevels("de", (label) => {
      switch (label) {
        case "A1":
          return {
            headline: "Foundations: pronunciation, articles, and daily basics.",
            topics: [
              { id: "de-a1-pron", title: "Pronunciation & Umlauts", description: "ä, ö, ü, ß and the mighty R.", minutes: 12, xp: 50 },
              { id: "de-a1-greetings", title: "Greetings & Small Talk", description: "Hallo, wie geht's, tschüss.", minutes: 10, xp: 40 },
              { id: "de-a1-articles", title: "Der, Die, Das", description: "The three genders — with tricks.", minutes: 15, xp: 70 },
              { id: "de-a1-numbers", title: "Numbers & Time", description: "Halb zehn, viertel nach.", minutes: 12, xp: 50 },
              { id: "de-a1-food", title: "Food & Drink", description: "Kaffee, Brot, Bier — order with confidence.", minutes: 12, xp: 50 },
              { id: "de-a1-verbs", title: "Present Tense Verbs", description: "sein, haben, and regular conjugation.", minutes: 18, xp: 80 },
              { id: "de-a1-daily", title: "Daily Conversation", description: "Everyday phrases you actually need.", minutes: 15, xp: 60 },
              { id: "de-a1-grammar", title: "Basic Grammar", description: "Word order and yes/no questions.", minutes: 18, xp: 80 },
            ],
          };
        case "A2":
          return {
            headline: "Cases enter the stage — nominative and accusative.",
            topics: [
              { id: "de-a2-cases", title: "Nominative & Accusative", description: "Den, einen — where they go.", minutes: 22, xp: 100 },
              { id: "de-a2-perfekt", title: "Perfekt Tense", description: "Ich habe gemacht — talk about the past.", minutes: 20, xp: 90 },
              { id: "de-a2-modals", title: "Modal Verbs", description: "können, müssen, wollen.", minutes: 18, xp: 80 },
              { id: "de-a2-travel", title: "Travel in Germany", description: "Bahn, U-Bahn, and asking for help.", minutes: 15, xp: 60 },
              { id: "de-a2-vocab", title: "Everyday Vocabulary", description: "Home, weather, hobbies.", minutes: 12, xp: 50 },
            ],
          };
        case "B1":
          return {
            headline: "Dative, prepositions, and richer stories.",
            topics: [
              { id: "de-b1-dative", title: "Dative Case", description: "Mit, bei, von — the dative crew.", minutes: 22, xp: 100 },
              { id: "de-b1-reading", title: "Reading Practice", description: "Short news articles.", minutes: 20, xp: 90 },
              { id: "de-b1-listening", title: "Listening: Podcasts", description: "Slow German-style clips.", minutes: 18, xp: 80 },
              { id: "de-b1-writing", title: "Emails & Messages", description: "Formal and informal.", minutes: 18, xp: 80 },
            ],
          };
        case "B2":
          return {
            headline: "Genitive, subjunctive, and confident writing.",
            topics: [
              { id: "de-b2-genitive", title: "Genitive Case", description: "The elegant possessive.", minutes: 20, xp: 90 },
              { id: "de-b2-konjunktiv", title: "Konjunktiv II", description: "Hypotheticals and politeness.", minutes: 22, xp: 100 },
              { id: "de-b2-business", title: "Business German", description: "Meetings, emails, and negotiations.", minutes: 20, xp: 90 },
            ],
          };
        case "C1":
          return {
            headline: "Nuance, culture, and academic language.",
            topics: [
              { id: "de-c1-academic", title: "Academic Writing", description: "Structure a German essay.", minutes: 25, xp: 110 },
              { id: "de-c1-idioms", title: "Idioms & Sayings", description: "Tomaten auf den Augen haben.", minutes: 18, xp: 80 },
              { id: "de-c1-media", title: "German Media", description: "Der Spiegel, Die Zeit.", minutes: 22, xp: 100 },
            ],
          };
        default:
          return {
            headline: "Near-native mastery.",
            topics: [
              { id: "de-c2-literature", title: "Literature", description: "Kafka, Mann, Herta Müller.", minutes: 30, xp: 130 },
              { id: "de-c2-philosophy", title: "Philosophy", description: "Kant and Nietzsche in the original.", minutes: 30, xp: 130 },
              { id: "de-c2-dialects", title: "Regional Dialects", description: "Bavarian, Swiss, Austrian.", minutes: 22, xp: 100 },
            ],
          };
      }
    }),
  },

  japanese: {
    id: "japanese",
    name: "Japanese",
    nativeName: "日本語",
    tagline: "Character, context, and quiet precision.",
    flag: "🇯🇵",
    levels: makeLevels("jp", (label) => {
      switch (label) {
        case "A1":
          return {
            headline: "Hiragana, Katakana, and your first 100 words.",
            topics: [
              { id: "jp-a1-hiragana", title: "Hiragana", description: "All 46 syllables — read your first words.", minutes: 20, xp: 90 },
              { id: "jp-a1-katakana", title: "Katakana", description: "For foreign words: コーヒー, テレビ.", minutes: 20, xp: 90 },
              { id: "jp-a1-greetings", title: "Greetings", description: "こんにちは, ありがとう, すみません.", minutes: 10, xp: 40 },
              { id: "jp-a1-numbers", title: "Numbers & Counting", description: "Counters — one of Japanese's quirks.", minutes: 15, xp: 60 },
              { id: "jp-a1-kanji", title: "First 20 Kanji", description: "日, 月, 火, 水 — start reading.", minutes: 20, xp: 90 },
              { id: "jp-a1-particles", title: "Particles は, が, を", description: "The heart of Japanese sentences.", minutes: 18, xp: 80 },
              { id: "jp-a1-food", title: "Food & Restaurants", description: "Order sushi, ramen, and coffee.", minutes: 12, xp: 50 },
            ],
          };
        case "A2":
          return {
            headline: "Verb forms, more kanji, and short conversations.",
            topics: [
              { id: "jp-a2-teform", title: "Te-form", description: "Connect verbs and make requests.", minutes: 22, xp: 100 },
              { id: "jp-a2-past", title: "Past Tense", description: "たform for casual, ましたform for polite.", minutes: 18, xp: 80 },
              { id: "jp-a2-kanji", title: "Kanji Set 2", description: "Another 50 essential characters.", minutes: 25, xp: 110 },
              { id: "jp-a2-shopping", title: "Shopping & Bargaining", description: "Tokyo department stores.", minutes: 12, xp: 50 },
              { id: "jp-a2-jlpt5", title: "JLPT N5 Practice", description: "Sample questions and strategies.", minutes: 25, xp: 110 },
            ],
          };
        case "B1":
          return {
            headline: "Nuanced grammar and reading short stories.",
            topics: [
              { id: "jp-b1-keigo", title: "Basic Keigo", description: "Polite and humble forms.", minutes: 22, xp: 100 },
              { id: "jp-b1-conditional", title: "Conditionals: たら/ば/と", description: "Which one to use when.", minutes: 20, xp: 90 },
              { id: "jp-b1-jlpt4", title: "JLPT N4 Practice", description: "Full mock section.", minutes: 30, xp: 130 },
              { id: "jp-b1-listening", title: "Listening: Anime Clips", description: "Real speech, real speed.", minutes: 18, xp: 80 },
            ],
          };
        case "B2":
          return {
            headline: "Idiom, keigo, and reading full articles.",
            topics: [
              { id: "jp-b2-keigo", title: "Advanced Keigo", description: "Sonkeigo and kenjougo in the workplace.", minutes: 25, xp: 110 },
              { id: "jp-b2-news", title: "News Japanese", description: "NHK Easy and beyond.", minutes: 22, xp: 100 },
              { id: "jp-b2-jlpt3", title: "JLPT N3 Practice", description: "Grammar, reading, listening.", minutes: 30, xp: 130 },
            ],
          };
        case "C1":
          return {
            headline: "Business Japanese and literary reading.",
            topics: [
              { id: "jp-c1-business", title: "Business Japanese", description: "Meetings, emails, keigo mastery.", minutes: 25, xp: 110 },
              { id: "jp-c1-jlpt2", title: "JLPT N2 Practice", description: "The threshold to fluency.", minutes: 35, xp: 150 },
              { id: "jp-c1-lit", title: "Modern Literature", description: "Murakami, Yoshimoto excerpts.", minutes: 30, xp: 130 },
            ],
          };
        default:
          return {
            headline: "N1-level mastery.",
            topics: [
              { id: "jp-c2-jlpt1", title: "JLPT N1 Practice", description: "The highest official level.", minutes: 40, xp: 180 },
              { id: "jp-c2-classical", title: "Classical Japanese", description: "Read the Tale of Genji.", minutes: 40, xp: 180 },
              { id: "jp-c2-poetry", title: "Haiku & Tanka", description: "Compose your own poetry.", minutes: 30, xp: 130 },
            ],
          };
      }
    }),
  },

  english: {
    id: "english",
    name: "English",
    nativeName: "English",
    tagline: "The global language of business, tech, and travel.",
    flag: "🇬🇧",
    levels: makeLevels("en", (label) => {
      switch (label) {
        case "A1":
          return {
            headline: "Foundations: alphabet, greetings, and everyday words.",
            topics: [
              { id: "en-a1-alphabet", title: "Alphabet & Sounds", description: "Start here — 26 letters and vowel sounds.", minutes: 12, xp: 50 },
              { id: "en-a1-numbers", title: "Numbers, Time & Dates", description: "Count, tell time, say the date.", minutes: 10, xp: 40 },
              { id: "en-a1-greetings", title: "Greetings & Introductions", description: "Hello, nice to meet you, small talk basics.", minutes: 10, xp: 40 },
              { id: "en-a1-family", title: "Family & People", description: "Mother, brother, describe your family.", minutes: 12, xp: 50 },
              { id: "en-a1-food", title: "Food & Ordering", description: "Café, restaurant, and grocery basics.", minutes: 15, xp: 60 },
              { id: "en-a1-verbs", title: "To be, to have, to do", description: "The three most important verbs.", minutes: 18, xp: 80 },
              { id: "en-a1-questions", title: "Asking Questions", description: "Who, what, where, when, why, how.", minutes: 12, xp: 50 },
              { id: "en-a1-travel", title: "Travel Essentials", description: "At the airport, hotel, and taxi.", minutes: 15, xp: 60 },
            ],
          };
        case "A2":
          return {
            headline: "Past tenses and everyday conversation.",
            topics: [
              { id: "en-a2-past", title: "Past Simple", description: "Regular and irregular past verbs.", minutes: 20, xp: 90 },
              { id: "en-a2-daily", title: "Daily Routine", description: "Wake up, work, unwind — describe your day.", minutes: 15, xp: 60 },
              { id: "en-a2-shopping", title: "Shopping & Prices", description: "Sizes, colors, negotiating.", minutes: 12, xp: 50 },
              { id: "en-a2-directions", title: "Directions in a City", description: "Turn left, straight ahead, opposite.", minutes: 12, xp: 50 },
              { id: "en-a2-weather", title: "Weather & Seasons", description: "Sunny, rainy, four seasons.", minutes: 10, xp: 40 },
              { id: "en-a2-modals", title: "Can, Could, Should", description: "Ability, requests, and advice.", minutes: 18, xp: 80 },
            ],
          };
        case "B1":
          return {
            headline: "Real conversations, opinions, and richer tenses.",
            topics: [
              { id: "en-b1-perfect", title: "Present Perfect", description: "Have you ever…? Life experience talk.", minutes: 20, xp: 90 },
              { id: "en-b1-future", title: "Future Forms", description: "Will, going to, present continuous.", minutes: 18, xp: 80 },
              { id: "en-b1-opinion", title: "Giving Opinions", description: "In my view, I think that…", minutes: 15, xp: 60 },
              { id: "en-b1-news", title: "Reading the News", description: "Headlines and short articles.", minutes: 20, xp: 90 },
              { id: "en-b1-work", title: "Work & Careers", description: "Interviews, CVs, and emails.", minutes: 18, xp: 80 },
            ],
          };
        case "B2":
          return {
            headline: "Fluent expression with nuance and idiom.",
            topics: [
              { id: "en-b2-conditionals", title: "Conditionals", description: "Zero, first, second, and third.", minutes: 22, xp: 100 },
              { id: "en-b2-passive", title: "Passive Voice", description: "When and why to use it.", minutes: 18, xp: 80 },
              { id: "en-b2-idioms", title: "Idiomatic Expressions", description: "Break the ice, hit the sack.", minutes: 15, xp: 70 },
              { id: "en-b2-debate", title: "Debate & Argumentation", description: "Structure a persuasive argument.", minutes: 20, xp: 90 },
            ],
          };
        case "C1":
          return {
            headline: "Sophisticated writing, culture, and register.",
            topics: [
              { id: "en-c1-register", title: "Formal vs Informal Register", description: "Match tone to setting.", minutes: 20, xp: 90 },
              { id: "en-c1-essay", title: "Argumentative Essays", description: "IELTS/TOEFL-style structure.", minutes: 25, xp: 110 },
              { id: "en-c1-media", title: "Films & Podcasts", description: "Native speed listening.", minutes: 22, xp: 100 },
            ],
          };
        default:
          return {
            headline: "Near-native mastery and literary depth.",
            topics: [
              { id: "en-c2-nuance", title: "Nuance & Subtext", description: "Read between the lines.", minutes: 25, xp: 110 },
              { id: "en-c2-classics", title: "Classical Literature", description: "Shakespeare, Austen, Orwell.", minutes: 30, xp: 130 },
              { id: "en-c2-academic", title: "Academic English", description: "Publish-ready writing.", minutes: 30, xp: 130 },
            ],
          };
      }
    }),
  },

  hindi_english: {
    id: "hindi_english",
    name: "English for Hindi speakers",
    nativeName: "अंग्रेज़ी (हिन्दी से)",
    tagline: "हिन्दी से अंग्रेज़ी सीखें — बुनियादी से लेकर धाराप्रवाह तक।",
    flag: "🇮🇳",
    levels: makeLevels("he", (label) => {
      switch (label) {
        case "A1":
          return {
            headline: "बुनियाद: वर्णमाला, अभिवादन, और रोज़मर्रा के शब्द।",
            topics: [
              { id: "he-a1-alphabet", title: "वर्णमाला (Alphabet)", description: "यहाँ से शुरू करें — A–Z उच्चारण।", minutes: 12, xp: 50 },
              { id: "he-a1-numbers", title: "गिनती व समय (Numbers & Time)", description: "One, two, three… और घड़ी पढ़ना।", minutes: 10, xp: 40 },
              { id: "he-a1-greetings", title: "अभिवादन (Greetings)", description: "Hello, good morning, nice to meet you.", minutes: 10, xp: 40 },
              { id: "he-a1-family", title: "परिवार (Family)", description: "Mother, father, brother — अपना परिवार बताइए।", minutes: 12, xp: 50 },
              { id: "he-a1-food", title: "खाना (Food)", description: "रेस्तराँ और दुकान में ऑर्डर करना।", minutes: 15, xp: 60 },
              { id: "he-a1-verbs", title: "क्रियाएँ: is / have / do", description: "अंग्रेज़ी की तीन ज़रूरी क्रियाएँ।", minutes: 18, xp: 80 },
              { id: "he-a1-questions", title: "प्रश्न पूछना", description: "Who, what, where, when, why, how.", minutes: 12, xp: 50 },
              { id: "he-a1-travel", title: "यात्रा (Travel)", description: "एयरपोर्ट, होटल, टैक्सी में बात।", minutes: 15, xp: 60 },
            ],
          };
        case "A2":
          return {
            headline: "बीता हुआ काल और रोज़मर्रा बातचीत।",
            topics: [
              { id: "he-a2-past", title: "Past Simple", description: "बीते समय की बात करना।", minutes: 20, xp: 90 },
              { id: "he-a2-daily", title: "दिनचर्या (Daily Routine)", description: "उठना, काम, आराम — अपना दिन बताइए।", minutes: 15, xp: 60 },
              { id: "he-a2-shopping", title: "खरीदारी (Shopping)", description: "साइज़, रंग, मोल-भाव।", minutes: 12, xp: 50 },
              { id: "he-a2-directions", title: "रास्ता पूछना", description: "Turn left, straight, opposite.", minutes: 12, xp: 50 },
              { id: "he-a2-modals", title: "Can / Could / Should", description: "क्षमता, अनुरोध, सलाह।", minutes: 18, xp: 80 },
            ],
          };
        case "B1":
          return {
            headline: "असली बातचीत, विचार, और गहरे व्याकरण के रूप।",
            topics: [
              { id: "he-b1-perfect", title: "Present Perfect", description: "अनुभव और हाल के काम।", minutes: 20, xp: 90 },
              { id: "he-b1-future", title: "Future Forms", description: "Will और going to का सही उपयोग।", minutes: 18, xp: 80 },
              { id: "he-b1-opinion", title: "अपनी राय देना", description: "In my opinion, I think that…", minutes: 15, xp: 60 },
              { id: "he-b1-work", title: "काम व करियर (Work)", description: "इंटरव्यू, ईमेल, फ़ोन कॉल।", minutes: 18, xp: 80 },
            ],
          };
        case "B2":
          return {
            headline: "धाराप्रवाह अभिव्यक्ति, मुहावरे और नुक्ते।",
            topics: [
              { id: "he-b2-conditionals", title: "Conditionals", description: "If clauses के चार रूप।", minutes: 22, xp: 100 },
              { id: "he-b2-passive", title: "Passive Voice", description: "कब और क्यों इस्तेमाल करें।", minutes: 18, xp: 80 },
              { id: "he-b2-idioms", title: "मुहावरे (Idioms)", description: "Break the ice, piece of cake.", minutes: 15, xp: 70 },
            ],
          };
        case "C1":
          return {
            headline: "उन्नत लेखन, संस्कृति, और formal register।",
            topics: [
              { id: "he-c1-essay", title: "निबंध लेखन (Essays)", description: "IELTS/TOEFL स्तर के essay।", minutes: 25, xp: 110 },
              { id: "he-c1-register", title: "Formal vs Informal", description: "Tone को situation के अनुरूप ढालना।", minutes: 20, xp: 90 },
              { id: "he-c1-media", title: "फ़िल्में व पॉडकास्ट", description: "Native speed सुनना और समझना।", minutes: 22, xp: 100 },
            ],
          };
        default:
          return {
            headline: "लगभग native स्तर की महारत।",
            topics: [
              { id: "he-c2-nuance", title: "गहरे अर्थ और subtext", description: "पंक्तियों के बीच पढ़ना।", minutes: 25, xp: 110 },
              { id: "he-c2-classics", title: "शास्त्रीय साहित्य", description: "Shakespeare, Orwell के अंश।", minutes: 30, xp: 130 },
              { id: "he-c2-academic", title: "Academic English", description: "शोध और publish-ready लेखन।", minutes: 30, xp: 130 },
            ],
          };
      }
    }),
  },
};

export const LANGUAGE_LIST: LanguageCourse[] = [
  CURRICULUM.french,
  CURRICULUM.german,
  CURRICULUM.japanese,
  CURRICULUM.english,
  CURRICULUM.hindi_english,
];

export function findTopic(lessonId: string): { language: LanguageCourse; level: Level; topic: Topic } | null {
  for (const language of LANGUAGE_LIST) {
    for (const level of language.levels) {
      const topic = level.topics.find((t) => t.id === lessonId);
      if (topic) return { language, level, topic };
    }
  }
  return null;
}
