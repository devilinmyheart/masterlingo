import type { LanguageId } from "./curriculum";

export interface Word {
  word: string;
  translation: string;
  pronunciation?: string;
  example: string;
  exampleTranslation: string;
}

export const STARTER_VOCAB: Record<LanguageId, Word[]> = {
  french: [
    { word: "bonjour", translation: "hello", pronunciation: "bon-ZHOOR", example: "Bonjour, comment ça va ?", exampleTranslation: "Hello, how are you?" },
    { word: "merci", translation: "thank you", pronunciation: "mair-SEE", example: "Merci beaucoup !", exampleTranslation: "Thank you very much!" },
    { word: "s'il vous plaît", translation: "please", pronunciation: "seel-voo-PLEH", example: "Un café, s'il vous plaît.", exampleTranslation: "A coffee, please." },
    { word: "oui", translation: "yes", pronunciation: "WEE", example: "Oui, avec plaisir.", exampleTranslation: "Yes, with pleasure." },
    { word: "non", translation: "no", pronunciation: "NOH(N)", example: "Non, merci.", exampleTranslation: "No, thank you." },
    { word: "aujourd'hui", translation: "today", pronunciation: "oh-zhoor-DWEE", example: "Il fait beau aujourd'hui.", exampleTranslation: "It's nice today." },
    { word: "demain", translation: "tomorrow", pronunciation: "duh-MAN", example: "À demain !", exampleTranslation: "See you tomorrow!" },
  ],
  german: [
    { word: "hallo", translation: "hello", pronunciation: "HAH-loh", example: "Hallo, wie geht's?", exampleTranslation: "Hello, how are you?" },
    { word: "danke", translation: "thank you", pronunciation: "DAHN-kuh", example: "Vielen Dank!", exampleTranslation: "Many thanks!" },
    { word: "bitte", translation: "please / you're welcome", pronunciation: "BIT-tuh", example: "Ein Kaffee, bitte.", exampleTranslation: "A coffee, please." },
    { word: "ja", translation: "yes", pronunciation: "yah", example: "Ja, gerne.", exampleTranslation: "Yes, gladly." },
    { word: "nein", translation: "no", pronunciation: "nine", example: "Nein, danke.", exampleTranslation: "No, thanks." },
    { word: "heute", translation: "today", pronunciation: "HOY-tuh", example: "Heute ist Montag.", exampleTranslation: "Today is Monday." },
    { word: "morgen", translation: "tomorrow / morning", pronunciation: "MOR-gen", example: "Bis morgen!", exampleTranslation: "Until tomorrow!" },
  ],
  japanese: [
    { word: "こんにちは", translation: "hello", pronunciation: "kon-ni-chi-wa", example: "こんにちは、田中さん。", exampleTranslation: "Hello, Mr. Tanaka." },
    { word: "ありがとう", translation: "thank you", pronunciation: "a-ri-ga-tou", example: "ありがとうございます。", exampleTranslation: "Thank you (polite)." },
    { word: "すみません", translation: "excuse me / sorry", pronunciation: "su-mi-ma-sen", example: "すみません、駅はどこですか?", exampleTranslation: "Excuse me, where is the station?" },
    { word: "はい", translation: "yes", pronunciation: "hai", example: "はい、そうです。", exampleTranslation: "Yes, that's right." },
    { word: "いいえ", translation: "no", pronunciation: "i-i-e", example: "いいえ、違います。", exampleTranslation: "No, that's not right." },
    { word: "今日", translation: "today", pronunciation: "kyou", example: "今日は暑いです。", exampleTranslation: "It's hot today." },
    { word: "明日", translation: "tomorrow", pronunciation: "a-shi-ta", example: "また明日!", exampleTranslation: "See you tomorrow!" },
  ],
  english: [
    { word: "hello", translation: "a greeting", pronunciation: "heh-LOH", example: "Hello, how are you today?", exampleTranslation: "A friendly greeting." },
    { word: "thank you", translation: "expression of gratitude", pronunciation: "THANK yoo", example: "Thank you for your help.", exampleTranslation: "Used to show appreciation." },
    { word: "please", translation: "polite request word", pronunciation: "PLEEZ", example: "A coffee, please.", exampleTranslation: "Softens any request." },
    { word: "sorry", translation: "apology", pronunciation: "SOR-ee", example: "Sorry, I'm late.", exampleTranslation: "Used to apologize." },
    { word: "today", translation: "this day", pronunciation: "tuh-DAY", example: "The weather is nice today.", exampleTranslation: "Refers to the current day." },
    { word: "tomorrow", translation: "the next day", pronunciation: "tuh-MOR-oh", example: "See you tomorrow!", exampleTranslation: "The day after today." },
    { word: "beautiful", translation: "very attractive", pronunciation: "BYOO-ti-ful", example: "What a beautiful morning.", exampleTranslation: "Describes something lovely." },
  ],
  hindi_english: [
    { word: "hello", translation: "नमस्ते / अभिवादन", pronunciation: "हेलो", example: "Hello, how are you?", exampleTranslation: "नमस्ते, आप कैसे हैं?" },
    { word: "thank you", translation: "धन्यवाद", pronunciation: "थैंक यू", example: "Thank you very much.", exampleTranslation: "बहुत बहुत धन्यवाद।" },
    { word: "please", translation: "कृपया", pronunciation: "प्लीज़", example: "A tea, please.", exampleTranslation: "एक चाय, कृपया।" },
    { word: "sorry", translation: "माफ़ कीजिए", pronunciation: "सॉरी", example: "Sorry, I'm late.", exampleTranslation: "माफ़ कीजिए, मुझे देर हो गई।" },
    { word: "yes", translation: "हाँ", pronunciation: "येस", example: "Yes, of course.", exampleTranslation: "हाँ, ज़रूर।" },
    { word: "no", translation: "नहीं", pronunciation: "नो", example: "No, thank you.", exampleTranslation: "नहीं, धन्यवाद।" },
    { word: "today", translation: "आज", pronunciation: "टुडे", example: "It is hot today.", exampleTranslation: "आज गर्मी है।" },
  ],
};
