// Pattern rules for each stage of a digital-arrest scam script.
// Each rule has a weight (how strongly it signals the stage) and a plain-language reason.
// Rules cover Hinglish (romanised), Devanagari Hindi and English.

export const STAGE_INFO = {
  authority: {
    label: "Authority",
    hindi: "अधिकार",
    explain: "The caller claims to be from police, CBI, customs, TRAI, RBI or another agency.",
  },
  fear: {
    label: "Fear",
    hindi: "डर",
    explain: "You are threatened with arrest, a criminal case, a warrant or a blocked number.",
  },
  isolation: {
    label: "Isolation",
    hindi: "अकेलापन",
    explain: "You are told to keep it secret, stay on the video call or not tell your family.",
  },
  payment: {
    label: "Payment",
    hindi: "पैसा",
    explain: "You are asked to move money, share an OTP or install a screen-sharing app.",
  },
};

export const RULES = {
  authority: [
    { re: /\b(cbi|ncb|trai|rbi|ips|dcp|cid|ed)\b/, w: 0.55, why: "names an investigating agency" },
    { re: /(crime branch|cyber (cell|crime)|narcotics|customs|enforcement directorate|central bureau|telecom regulatory|reserve bank|supreme court|income tax|police|inspector|officer|commissioner|the bureau)/, w: 0.4, why: "claims to be an official" },
    { re: /(सीबीआई|पुलिस|क्राइम ब्रांच|इंस्पेक्टर|अधिकारी|निदेशालय|दूरसंचार|नियामक|रिज़र्व बैंक|सुप्रीम कोर्ट|नारकोटिक्स|कस्टम|साइबर अपराध)/, w: 0.4, why: "claims to be an official" },
    { re: /(vibhag|department|विभाग)/, w: 0.2, why: "claims to be from a government department" },
  ],
  fear: [
    { re: /(digital arrest|arrest|giraftar|warrant|\bfir\b|money laundering|hawala|drugs|mdma|narcotic|seized|illegal|jail|terror|trafficking|non.?bailable|benami)/, w: 0.55, why: "threatens arrest or a criminal case" },
    { re: /(case (darj|registered)|complaints? (me )?linked|under investigation|be frozen|band kar|kaat diya jayega|notice)/, w: 0.4, why: "threatens legal action or a cut-off" },
    { re: /(गिरफ्तार|वारंट|जमानती|मनी लॉन्ड्रिंग|ड्रग्स|जेल|केस दर्ज|आतंकवादी|बंद कर दिया जाएगा|शिकायतें|संदिग्ध|अपराध)/, w: 0.5, why: "threatens arrest or a criminal case" },
    { re: /(aadhaar|aadhar|\bpan\b|your identity|आधार|आपके नाम|aapke naam)/, w: 0.2, why: "ties the threat to your identity" },
  ],
  isolation: [
    { re: /(mat batana|mat batao|nahi batayenge|nahi batani|dont tell|do not tell|do not discuss|cannot discuss|confidential|secret|keep this matter private|गोपनीय|किसी को न|मत बताना|न दें|किसी से भी)/, w: 0.6, why: "tells you to keep it secret" },
    { re: /(video call|camera on|on camera|skype|disconnect|call (mat )?kaat|monitored|nigrani|private room|darwaza|वीडियो कॉल|कैमरा|फोन मत रखिए|कॉल मत काटिए|कॉल काटने|निगरानी|दरवाज़ा)/, w: 0.55, why: "keeps you on the call and watched" },
    { re: /(national security|lawyer ya bank|kisi lawyer)/, w: 0.4, why: "cuts you off from help" },
  ],
  payment: [
    { re: /(transfer|rtgs|neft|imps|upi|deposit|escrow|safe account|secure account|verification account|payment|penalty|clearance fee|security amount|jama|bhej)/, w: 0.45, why: "asks you to move money" },
    { re: /(\botp\b|anydesk|teamviewer|screen share|app (install|download)|download kijiye|six digit code|open the link)/, w: 0.5, why: "asks for an OTP or remote access" },
    { re: /(saare paise|sara balance|saare funds|all the money|funds in your|fd tod|gold loan|bank balance|refunded|wapas mil)/, w: 0.35, why: "asks for your savings, promising a refund" },
    { re: /(खाते में|जमा|भेजिए|पेमेंट|राशि|बैलेंस|स्थानांतरित|ओटीपी|स्क्रीन शेयर|जमा पूंजी)/, w: 0.45, why: "asks you to move money" },
  ],
};

// Phrases genuine callers use. They lower the risk of the whole call.
export const PROTECTIVE = [
  /(never ask|will never|nahi maangta|nahi maangte|never arrest|nahi karti|jhooth|scam tha|fake cbi|phone kaat dena)/,
  /(branch (me|par|manager)|branch aakar|at our branch|official app|card ke peeche|back of your card)/,
  /(no fee|koi fees nahi|no hurry|koi jaldi nahi|fees ki chinta mat)/,
];

// Words that show the caller is talking to you directly.
export const DIRECT = /(\baap|\btum|\byou\b|\byour\b|आप|तुम|तुम्हारे)/;

// Words that show the caller is telling a story about someone else.
export const NARRATIVE = /(news|unhone|unko|\buncle\b|they told him|someone|\bhe almost\b|his son|usko|suna)/;

// Flat keyword list used only by the keyword baseline in the benchmark.
export const KEYWORDS = /(arrest|police|cbi|otp|transfer|account|warrant|parcel|customs|kyc|upi|fir\b|पुलिस|गिरफ्तार|खाते|ओटीपी|वारंट)/;

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[.,!?;:"'()[\]{}।…–—-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
