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
};
