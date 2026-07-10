import type { LanguageId } from "./curriculum";

export type Certification = {
  name: string;
  provider: string;
  kind: "Certification" | "Diploma" | "Degree" | "Course";
  levels: string;
  format: "Online" | "In-person" | "Hybrid" | "Exam center";
  duration: string;
  priceUSD: string;
  description: string;
  url: string;
};

export const CERTIFICATIONS: Record<LanguageId, Certification[]> = {
  french: [
    {
      name: "DELF (A1–B2) & DALF (C1–C2)",
      provider: "France Éducation International (Ministry of Education, France)",
      kind: "Certification",
      levels: "A1 to C2",
      format: "Exam center",
      duration: "Half-day per level",
      priceUSD: "$90–$260",
      description:
        "The official French government diploma for non-native speakers. Life-long validity and recognised by universities and employers worldwide.",
      url: "https://www.france-education-international.fr/en/diplome/delf-dalf",
    },
    {
      name: "TCF – Test de connaissance du français",
      provider: "France Éducation International",
      kind: "Certification",
      levels: "A1 to C2",
      format: "Exam center",
      duration: "~2 hours",
      priceUSD: "$100–$180",
      description:
        "Standardised French proficiency test used for university admission in France, Québec immigration (TCF Canada), and naturalisation.",
      url: "https://www.france-education-international.fr/en/test/tcf",
    },
    {
      name: "Alliance Française – Certificate & Diploma Programs",
      provider: "Alliance Française (global network)",
      kind: "Diploma",
      levels: "A1 to C2",
      format: "Hybrid",
      duration: "1–12 months",
      priceUSD: "$250–$1,500",
      description:
        "Structured courses at 800+ centres globally, culminating in DELF/DALF preparation and internal Alliance Française diplomas.",
      url: "https://www.alliancefr.org/en/learn-french/",
    },
    {
      name: "Coursera – Learn French Specialization (École Polytechnique)",
      provider: "Coursera · École Polytechnique",
      kind: "Course",
      levels: "A1 to B1",
      format: "Online",
      duration: "~4 months",
      priceUSD: "$49/mo",
      description:
        "University-produced specialization covering everyday French, grammar and conversation, with a shareable Coursera certificate.",
      url: "https://www.coursera.org/specializations/learn-french",
    },
    {
      name: "MA in French Studies",
      provider: "Sorbonne Université (Paris)",
      kind: "Degree",
      levels: "C1+",
      format: "In-person",
      duration: "2 years",
      priceUSD: "~$4,500/year (EU) · $4,500–$18,000 (non-EU)",
      description:
        "Graduate degree in French language, literature and civilisation from one of the world's most prestigious French universities.",
      url: "https://lettres.sorbonne-universite.fr/en/degrees-and-programmes",
    },
  ],
  german: [
    {
      name: "Goethe-Zertifikat (A1–C2)",
      provider: "Goethe-Institut",
      kind: "Certification",
      levels: "A1 to C2",
      format: "Exam center",
      duration: "Half to full day",
      priceUSD: "$100–$310",
      description:
        "The world's most recognised German proficiency exam. Accepted by German universities, employers and immigration authorities.",
      url: "https://www.goethe.de/en/spr/kup/prf.html",
    },
    {
      name: "TestDaF – Test Deutsch als Fremdsprache",
      provider: "TestDaF-Institut",
      kind: "Certification",
      levels: "B2 to C1",
      format: "Exam center",
      duration: "~3 hours 10 minutes",
      priceUSD: "$220",
      description:
        "Standardised academic German test required by most German universities for international admissions.",
      url: "https://www.testdaf.de/en/",
    },
    {
      name: "telc Deutsch (A1–C2)",
      provider: "telc GmbH",
      kind: "Certification",
      levels: "A1 to C2",
      format: "Exam center",
      duration: "3–5 hours",
      priceUSD: "$120–$280",
      description:
        "Government-recognised German exams accepted for residency, naturalisation and professional licensing across Germany, Austria and Switzerland.",
      url: "https://www.telc.net/en/candidates/language-examinations/",
    },
    {
      name: "Coursera – German for Beginners Specialization",
      provider: "Coursera · University of Virginia",
      kind: "Course",
      levels: "A1 to A2",
      format: "Online",
      duration: "~3 months",
      priceUSD: "$49/mo",
      description:
        "Beginner-friendly online specialization with a verified certificate covering pronunciation, grammar and everyday conversation.",
      url: "https://www.coursera.org/specializations/learn-german-speak",
    },
    {
      name: "BA / MA in German Studies (Germanistik)",
      provider: "Ludwig-Maximilians-Universität München",
      kind: "Degree",
      levels: "C1+",
      format: "In-person",
      duration: "3–5 years",
      priceUSD: "~$350/semester (fees only)",
      description:
        "Full undergraduate or graduate degree in German language, literature and linguistics at a top-ranked German public university.",
      url: "https://www.lmu.de/en/study/all-degrees/index.html",
    },
  ],
  japanese: [
    {
      name: "JLPT – Japanese Language Proficiency Test (N5–N1)",
      provider: "Japan Foundation & JEES",
      kind: "Certification",
      levels: "N5 (beginner) to N1 (advanced)",
      format: "Exam center",
      duration: "~2 to 3 hours",
      priceUSD: "$50–$85",
      description:
        "The world's most widely-recognised Japanese proficiency exam. N2/N1 is required for most jobs, universities and visa points in Japan.",
      url: "https://www.jlpt.jp/e/",
    },
    {
      name: "J.TEST – Test of Practical Japanese",
      provider: "Japanese Language Testing Association",
      kind: "Certification",
      levels: "Beginner to advanced business",
      format: "Exam center",
      duration: "~2 hours",
      priceUSD: "$45",
      description:
        "Held six times a year, focused on real-world and business Japanese. Widely used by companies hiring foreign workers in Japan.",
      url: "https://j-test.jp/en",
    },
    {
      name: "BJT – Business Japanese Proficiency Test",
      provider: "Japan Kanji Aptitude Testing Foundation",
      kind: "Certification",
      levels: "Business (equivalent to N2–N1)",
      format: "Online",
      duration: "~2 hours",
      priceUSD: "$75",
      description:
        "Computer-based business Japanese exam recognised by the Japanese Ministry of Justice for the Highly Skilled Professional visa.",
      url: "https://www.kanken.or.jp/bjt/english/",
    },
    {
      name: "Marugoto – Japanese Online Course",
      provider: "The Japan Foundation",
      kind: "Course",
      levels: "A1 to B1",
      format: "Online",
      duration: "Self-paced",
      priceUSD: "Free",
      description:
        "Free official Japanese course from the Japan Foundation, aligned with CEFR/JF Standard, ideal for beginners to intermediate learners.",
      url: "https://minato-jf.jp/",
    },
    {
      name: "Japanese Language Programs",
      provider: "Waseda University · School of International Liberal Studies",
      kind: "Degree",
      levels: "A1 to C2",
      format: "In-person",
      duration: "1 semester to 4 years",
      priceUSD: "$4,000–$18,000/year",
      description:
        "Short-term intensive Japanese and full BA programs at one of Japan's most respected private universities.",
      url: "https://www.waseda.jp/inst/cjl/en/",
    },
  ],
  english: [
    {
      name: "IELTS Academic & General",
      provider: "British Council · IDP · Cambridge",
      kind: "Certification",
      levels: "A1 to C2 (band 1–9)",
      format: "Exam center",
      duration: "~2 hours 45 minutes",
      priceUSD: "$215–$260",
      description:
        "The world's most popular English test for study, work and migration. Accepted by 12,000+ organisations globally.",
      url: "https://www.ielts.org/",
    },
    {
      name: "TOEFL iBT",
      provider: "ETS",
      kind: "Certification",
      levels: "B1 to C2",
      format: "Online",
      duration: "~2 hours",
      priceUSD: "$185–$325",
      description:
        "Academic English test accepted by 12,500+ universities in 160+ countries, especially in North America.",
      url: "https://www.ets.org/toefl.html",
    },
    {
      name: "Cambridge English Qualifications (B2 First, C1 Advanced, C2 Proficiency)",
      provider: "Cambridge University Press & Assessment",
      kind: "Certification",
      levels: "A2 to C2",
      format: "Exam center",
      duration: "3–4 hours",
      priceUSD: "$180–$260",
      description:
        "Lifetime-valid Cambridge certificates accepted for university admission, visas and employment in over 130 countries.",
      url: "https://www.cambridgeenglish.org/exams-and-tests/qualifications/",
    },
    {
      name: "Duolingo English Test",
      provider: "Duolingo",
      kind: "Certification",
      levels: "A1 to C2",
      format: "Online",
      duration: "~1 hour",
      priceUSD: "$65",
      description:
        "Fully online, on-demand English proficiency test now accepted by 5,500+ universities including many Ivy League institutions.",
      url: "https://englishtest.duolingo.com/",
    },
    {
      name: "MA in Applied Linguistics / TESOL",
      provider: "University of Cambridge · Faculty of Modern & Medieval Languages",
      kind: "Degree",
      levels: "C1+",
      format: "In-person",
      duration: "1 year (MPhil)",
      priceUSD: "~$35,000–$45,000",
      description:
        "Graduate degree preparing English teachers and researchers for careers in academia and ELT worldwide.",
      url: "https://www.mmll.cam.ac.uk/",
    },
  ],
  hindi_english: [
    {
      name: "IELTS (हिंदी माध्यम तैयारी)",
      provider: "British Council India · IDP India",
      kind: "Certification",
      levels: "A1 to C2 (band 1–9)",
      format: "Exam center",
      duration: "~2 घंटे 45 मिनट",
      priceUSD: "₹17,000 (~$205)",
      description:
        "विदेश में पढ़ाई, नौकरी और PR के लिए भारत में सबसे लोकप्रिय अंग्रेज़ी परीक्षा। 140+ देशों में मान्य।",
      url: "https://www.britishcouncil.in/exam/ielts",
    },
    {
      name: "TOEFL iBT",
      provider: "ETS India",
      kind: "Certification",
      levels: "B1 to C2",
      format: "Online",
      duration: "~2 घंटे",
      priceUSD: "₹16,900 (~$200)",
      description:
        "अमेरिकी और कनाडाई विश्वविद्यालयों के लिए मानक अंग्रेज़ी टेस्ट, घर से भी दिया जा सकता है।",
      url: "https://www.ets.org/toefl.html",
    },
    {
      name: "Cambridge English (B1 Preliminary, B2 First, C1 Advanced)",
      provider: "Cambridge Assessment India",
      kind: "Certification",
      levels: "A2 to C2",
      format: "Exam center",
      duration: "3–4 घंटे",
      priceUSD: "₹9,500–₹15,000",
      description:
        "जीवन-भर वैध Cambridge प्रमाण-पत्र, स्कूल और कॉर्पोरेट भर्ती के लिए भारत में व्यापक रूप से स्वीकार्य।",
      url: "https://www.cambridgeenglish.org/in/",
    },
    {
      name: "IGNOU – Certificate in Functional English (CFE)",
      provider: "Indira Gandhi National Open University",
      kind: "Certification",
      levels: "A2 to B1",
      format: "Hybrid",
      duration: "6 महीने – 2 साल",
      priceUSD: "₹1,200–₹3,000",
      description:
        "IGNOU का सस्ता, सरकारी मान्यता प्राप्त कोर्स जो हिंदी माध्यम के छात्रों को व्यावहारिक अंग्रेज़ी सिखाता है।",
      url: "https://www.ignou.ac.in/ignou/aboutignou/school/soh/programmes/detail/113/2",
    },
    {
      name: "B.A. (Hons) English",
      provider: "Delhi University · Jamia Millia Islamia",
      kind: "Degree",
      levels: "C1+",
      format: "In-person",
      duration: "3 साल",
      priceUSD: "₹15,000–₹40,000/year",
      description:
        "अंग्रेज़ी साहित्य और भाषा में स्नातक डिग्री — पत्रकारिता, शिक्षण और सिविल सेवा की तैयारी के लिए आदर्श।",
      url: "https://www.du.ac.in/",
    },
  ],
};
