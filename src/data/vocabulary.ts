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
    // Greetings & courtesy
    { word: "hello", translation: "a greeting", pronunciation: "heh-LOH", example: "Hello, how are you today?", exampleTranslation: "A friendly greeting used any time of day." },
    { word: "good morning", translation: "morning greeting", pronunciation: "good MOR-ning", example: "Good morning, everyone!", exampleTranslation: "Used until about noon." },
    { word: "thank you", translation: "expression of gratitude", pronunciation: "THANK yoo", example: "Thank you for your help.", exampleTranslation: "Used to show appreciation." },
    { word: "please", translation: "polite request word", pronunciation: "PLEEZ", example: "A coffee, please.", exampleTranslation: "Softens any request." },
    { word: "sorry", translation: "apology", pronunciation: "SOR-ee", example: "Sorry, I'm late.", exampleTranslation: "Used to apologize." },
    { word: "excuse me", translation: "polite interruption", pronunciation: "ex-KYOOZ mee", example: "Excuse me, where is the exit?", exampleTranslation: "Used to get attention politely." },
    // Time
    { word: "today", translation: "this day", pronunciation: "tuh-DAY", example: "The weather is nice today.", exampleTranslation: "Refers to the current day." },
    { word: "tomorrow", translation: "the next day", pronunciation: "tuh-MOR-oh", example: "See you tomorrow!", exampleTranslation: "The day after today." },
    { word: "yesterday", translation: "the previous day", pronunciation: "YES-ter-day", example: "I called you yesterday.", exampleTranslation: "The day before today." },
    { word: "now", translation: "at this moment", pronunciation: "NOW", example: "Let's start now.", exampleTranslation: "Refers to the present instant." },
    // Grammar pattern words (be / have / do / can)
    { word: "I am", translation: "first person of 'to be'", pronunciation: "eye AM", example: "I am a student.", exampleTranslation: "Introduces who you are." },
    { word: "you are", translation: "second person of 'to be'", pronunciation: "yoo AR", example: "You are very kind.", exampleTranslation: "Addresses one or more people." },
    { word: "have", translation: "possess or own", pronunciation: "HAV", example: "I have two brothers.", exampleTranslation: "Expresses possession." },
    { word: "do", translation: "perform an action", pronunciation: "DOO", example: "What do you do?", exampleTranslation: "Also used to form questions." },
    { word: "can", translation: "be able to", pronunciation: "KAN", example: "I can speak English.", exampleTranslation: "Expresses ability." },
    // Question words
    { word: "what", translation: "asks about a thing", pronunciation: "WOT", example: "What is your name?", exampleTranslation: "Basic question opener." },
    { word: "where", translation: "asks about a place", pronunciation: "WAIR", example: "Where do you live?", exampleTranslation: "Asks for a location." },
    { word: "how much", translation: "asks about price/quantity", pronunciation: "HOW much", example: "How much is this?", exampleTranslation: "Common at markets and shops." },
    // Everyday
    { word: "beautiful", translation: "very attractive", pronunciation: "BYOO-ti-ful", example: "What a beautiful morning.", exampleTranslation: "Describes something lovely." },
    { word: "water", translation: "drinking water", pronunciation: "WA-ter", example: "Can I have some water, please?", exampleTranslation: "A polite table request." },
  ],
  hindi_english: [
    // Greetings & courtesy
    { word: "hello", translation: "नमस्ते / अभिवादन", pronunciation: "हेलो", example: "Hello, how are you?", exampleTranslation: "नमस्ते, आप कैसे हैं?" },
    { word: "good morning", translation: "सुप्रभात", pronunciation: "गुड मॉर्निंग", example: "Good morning, sir.", exampleTranslation: "सुप्रभात, श्रीमान।" },
    { word: "thank you", translation: "धन्यवाद", pronunciation: "थैंक यू", example: "Thank you very much.", exampleTranslation: "बहुत बहुत धन्यवाद।" },
    { word: "please", translation: "कृपया", pronunciation: "प्लीज़", example: "A tea, please.", exampleTranslation: "एक चाय, कृपया।" },
    { word: "sorry", translation: "माफ़ कीजिए", pronunciation: "सॉरी", example: "Sorry, I'm late.", exampleTranslation: "माफ़ कीजिए, मुझे देर हो गई।" },
    { word: "excuse me", translation: "क्षमा कीजिए / सुनिए", pronunciation: "एक्सक्यूज़ मी", example: "Excuse me, where is the station?", exampleTranslation: "सुनिए, स्टेशन कहाँ है?" },
    { word: "yes", translation: "हाँ", pronunciation: "येस", example: "Yes, of course.", exampleTranslation: "हाँ, ज़रूर।" },
    { word: "no", translation: "नहीं", pronunciation: "नो", example: "No, thank you.", exampleTranslation: "नहीं, धन्यवाद।" },
    // Time
    { word: "today", translation: "आज", pronunciation: "टुडे", example: "It is hot today.", exampleTranslation: "आज गर्मी है।" },
    { word: "tomorrow", translation: "कल (आने वाला)", pronunciation: "टुमॉरो", example: "See you tomorrow.", exampleTranslation: "कल मिलते हैं।" },
    { word: "yesterday", translation: "कल (बीता हुआ)", pronunciation: "येस्टरडे", example: "I met him yesterday.", exampleTranslation: "मैं उनसे कल मिला।" },
    // Grammar patterns
    { word: "I am", translation: "मैं हूँ", pronunciation: "आई ऐम", example: "I am a student.", exampleTranslation: "मैं एक छात्र हूँ।" },
    { word: "you are", translation: "आप हैं / तुम हो", pronunciation: "यू आर", example: "You are very kind.", exampleTranslation: "आप बहुत दयालु हैं।" },
    { word: "he is", translation: "वह है", pronunciation: "ही इज़", example: "He is my brother.", exampleTranslation: "वह मेरा भाई है।" },
    { word: "have", translation: "के पास होना", pronunciation: "हैव", example: "I have a car.", exampleTranslation: "मेरे पास एक गाड़ी है।" },
    { word: "can", translation: "सकना (योग्यता)", pronunciation: "कैन", example: "I can speak Hindi.", exampleTranslation: "मैं हिंदी बोल सकता हूँ।" },
    // Question words
    { word: "what", translation: "क्या", pronunciation: "व्हाट", example: "What is this?", exampleTranslation: "यह क्या है?" },
    { word: "where", translation: "कहाँ", pronunciation: "व्हेयर", example: "Where do you live?", exampleTranslation: "आप कहाँ रहते हैं?" },
    { word: "how much", translation: "कितना (दाम)", pronunciation: "हाउ मच", example: "How much is this?", exampleTranslation: "यह कितने का है?" },
    // Everyday
    { word: "water", translation: "पानी", pronunciation: "वॉटर", example: "A glass of water, please.", exampleTranslation: "एक गिलास पानी, कृपया।" },
    { word: "food", translation: "खाना", pronunciation: "फ़ूड", example: "The food is delicious.", exampleTranslation: "खाना बहुत स्वादिष्ट है।" },
  ],
};
