// Hand-written calls, never used for training or threshold selection.
//
// ADVERSARIAL: written in different words from the phrase banks, including
// scam types the generator does not produce (tax, electricity, KYC) and
// genuine calls that sound threatening (loan recovery, police, HR).
// SAMPLES: the calls played in the web demo. `voices` assigns each speaker a
// voice for scripts/voices.js (male1 is the scam caller).
//
// Line format: [speaker, text, stage]. Speaker is "c" (caller) or "u" (user).
// Stage is the scam stage the line belongs to, or null.

export const ADVERSARIAL = [
  {
    id: "adv-scam-income-tax", label: "scam",
    lines: [
      ["c", "Namaste, main Income Tax vibhag se Additional Commissioner ke office se bol raha hoon", "authority"],
      ["u", "Ji, boliye", null],
      ["c", "Aapka PAN ek benami property ke maamle me saamne aaya hai, notice aapke ghar ja raha hai", "fear"],
      ["c", "Yeh maamla aaj hi settle ho sakta hai agar aap penalty online bhar dein", "payment"],
      ["u", "Kitni penalty?", null],
      ["c", "Pachas hazaar, main aapko link bhejta hoon", "payment"],
    ],
  },
  {
    id: "adv-scam-electricity", label: "scam",
    lines: [
      ["c", "Hello, bijli vibhag se bol rahe hain", "authority"],
      ["c", "Aapka connection aaj raat saadhe nau baje kaat diya jayega, pichla bill update nahi hua", "fear"],
      ["u", "Par maine bill bhar diya tha", null],
      ["c", "System me nahi dikh raha, hamare officer ka number save kijiye aur ek app download kijiye", "payment"],
      ["c", "Sirf das rupaye ka payment karke record update ho jayega", "payment"],
    ],
  },
  {
    id: "adv-scam-kyc", label: "scam",
    lines: [
      ["c", "Good morning, I am calling from the account verification desk", "authority"],
      ["c", "Your KYC has expired and the account will be frozen by this evening", "fear"],
      ["u", "Oh, what should I do?", null],
      ["c", "Just open the link in the SMS and type the six digit code you receive", "payment"],
    ],
  },
  {
    id: "adv-scam-euphemism", label: "scam",
    lines: [
      ["c", "Good morning, this is an officer from the Bureau", "authority"],
      ["c", "A consignment registered under your identity documents has been intercepted", "fear"],
      ["u", "I have not sent anything", null],
      ["c", "You are required to remain available on camera for questioning and keep this matter private", "isolation"],
      ["c", "The funds in your accounts must be cleared through a regulatory check before the case is closed", "payment"],
    ],
  },
  {
    id: "adv-scam-hindi-formal", label: "scam",
    lines: [
      ["c", "मैं साइबर अपराध शाखा से वरिष्ठ अधिकारी बोल रहा हूँ", "authority"],
      ["c", "आपके नाम पर कई संदिग्ध लेनदेन दर्ज हुए हैं", "fear"],
      ["u", "क्या? मुझे नहीं पता", null],
      ["c", "यह जांच पूरी तरह गोपनीय है, इसकी जानकारी किसी को न दें", "isolation"],
      ["c", "अपनी जमा पूंजी हमारे निर्धारित खाते में स्थानांतरित करें", "payment"],
    ],
  },
  {
    id: "adv-scam-courier-handoff", label: "scam",
    lines: [
      ["c", "Hello, courier company se bol rahe hain, aapka package Taiwan ja raha tha", null],
      ["c", "Usme illegal items mile hain, main aapki call Mumbai police ko connect karta hoon", "fear"],
      ["c", "Haan ji, main police inspector, aapka statement lena hai", "authority"],
      ["c", "Kisi ko call ke baare me mat batana, aap jaanch ke ghere me hain", "isolation"],
      ["u", "Ab kya karun?", null],
      ["c", "Apna bank balance verification ke liye hamare account me bhejiye", "payment"],
    ],
  },
  {
    id: "adv-genuine-loan-recovery", label: "genuine",
    lines: [
      ["c", "Namaste, main aapke bank ki loan recovery team se bol raha hoon", null],
      ["c", "Aapki EMI teen mahine se due hai, payment nahi hua to legal notice jayega", null],
      ["u", "Haan, thodi problem chal rahi thi", null],
      ["c", "Aap branch aakar ya official app se payment kar sakte hain", null],
      ["c", "Restructuring chahiye to branch manager se mil lijiye", null],
    ],
  },
  {
    id: "adv-genuine-lost-phone", label: "genuine",
    lines: [
      ["c", "Main sector athara thane se head constable bol raha hoon", null],
      ["c", "Aapka khoya hua phone mil gaya hai, aakar le jaiye", null],
      ["u", "Arre wah, kab aa sakta hoon?", null],
      ["c", "Kal din me kabhi bhi, apna ID proof aur bill saath laana", null],
    ],
  },
  {
    id: "adv-genuine-lawyer", label: "genuine",
    lines: [
      ["c", "Tumhare property case ki hearing agle hafte court me hai", null],
      ["c", "Registry ke documents le aana, judge unhe dekhna chahenge", null],
      ["u", "Theek hai chacha, fees kitni hogi?", null],
      ["c", "Fees ki chinta mat karo, case ke baad dekh lenge", null],
    ],
  },
  {
    id: "adv-genuine-son-warning", label: "genuine",
    lines: [
      ["c", "Mummy, agar koi CBI ya police wala call karke paise maange to phone kaat dena", null],
      ["c", "Woh bolenge digital arrest hai, kisi ko mat batana, par yeh sab jhooth hota hai", null],
      ["u", "Accha beta, theek hai", null],
      ["c", "Aur kisi ko bhi OTP mat batana, koi bhi ho", null],
    ],
  },
  {
    id: "adv-genuine-hr", label: "genuine",
    lines: [
      ["c", "Hi, this is HR, your salary account details are missing", null],
      ["c", "Please update your bank account number on the HR portal before Friday", null],
      ["u", "Sure, I'll do it today", null],
      ["c", "Thanks, payroll runs on the twenty fifth", null],
    ],
  },
  {
    id: "adv-genuine-bank-welcome", label: "genuine",
    lines: [
      ["c", "Welcome to the bank, this is a courtesy call about your new savings account", null],
      ["c", "Your debit card will arrive in seven days, please set the PIN at an ATM", null],
      ["u", "Okay, thank you", null],
      ["c", "Remember we will never call you to ask for your PIN or OTP", null],
    ],
  },
];

export const SAMPLES = [
  {
    id: "sample-cbi", label: "scam",
    voices: { c: "male1", u: "female1" },
    title: "Digital arrest: fake CBI officer",
    short: "Fake CBI officer",
    language: "Hinglish",
    lines: [
      ["c", "Hello, kya meri baat Sunita Verma ji se ho rahi hai?", null],
      ["u", "Haan ji, boliye", null],
      ["c", "Main CBI Delhi se Inspector Rakesh Malhotra bol raha hoon", "authority"],
      ["c", "Aapke Aadhaar se ek account khula hai jo money laundering case me use hua hai", "fear"],
      ["u", "Kya? Maine toh aisa kuch nahi kiya", null],
      ["c", "Aapke khilaf arrest warrant jaari ho chuka hai, aap abhi digital arrest me hain", "fear"],
      ["c", "Yeh case confidential hai, apni family me kisi ko mat batana", "isolation"],
      ["c", "Video call chalu rakhiye aur call disconnect mat kijiye", "isolation"],
      ["u", "Theek hai sir, main kya karun?", null],
      ["c", "Verification ke liye apne saare paise RBI ke safe account me transfer kijiye", "payment"],
      ["c", "Jaanch ke baad paisa wapas mil jayega", "payment"],
    ],
  },
  {
    id: "sample-customs", label: "scam",
    voices: { c: "male1", u: "male2" },
    title: "Parcel with drugs: fake customs officer",
    short: "Fake customs officer",
    language: "English",
    lines: [
      ["c", "Good morning, am I speaking with Mr Arjun Nair?", null],
      ["u", "Yes, who is this?", null],
      ["c", "This is Officer Desai from the customs department at Mumbai airport", "authority"],
      ["c", "A parcel booked in your name was seized, it contains drugs and three fake passports", "fear"],
      ["u", "That's impossible, I never sent any parcel", null],
      ["c", "An FIR has been registered and the narcotics bureau is involved", "fear"],
      ["c", "This is a matter of national security, do not discuss it with anyone", "isolation"],
      ["c", "To clear your name, you must transfer the amount in your account to a verification account", "payment"],
    ],
  },
  {
    id: "sample-trai", label: "scam",
    voices: { c: "male1", u: "female1" },
    title: "SIM block: fake TRAI officer",
    short: "Fake TRAI officer",
    language: "Hindi",
    lines: [
      ["c", "नमस्कार, मैं दूरसंचार नियामक प्राधिकरण से बोल रहा हूँ", "authority"],
      ["u", "जी, बताइए", null],
      ["c", "आपके नंबर पर कई साइबर अपराध की शिकायतें दर्ज हैं", "fear"],
      ["c", "दो घंटे में आपका नंबर बंद कर दिया जाएगा और आपके खिलाफ केस दर्ज होगा", "fear"],
      ["u", "मैंने कुछ गलत नहीं किया", null],
      ["c", "कॉल मत काटिए, अब मैं आपको पुलिस अधिकारी से जोड़ रहा हूँ", "isolation"],
      ["c", "मामला खत्म करने के लिए जमानत की राशि अभी ऑनलाइन जमा करनी होगी", "payment"],
    ],
  },
  {
    id: "sample-bank", label: "genuine",
    voices: { c: "female2", u: "male2" },
    title: "Genuine: bank fraud alert",
    short: "Real bank alert",
    language: "Hinglish",
    lines: [
      ["c", "Namaste, main aapke bank ki fraud prevention team se bol rahi hoon", null],
      ["c", "Aapke card se abhi 15,000 rupaye ka transaction try hua hai, kya yeh aapne kiya?", null],
      ["u", "Nahi, maine nahi kiya", null],
      ["c", "Humne card turant block kar diya hai, aapka paisa surakshit hai", null],
      ["c", "Naya card aapke registered address par aa jayega", null],
      ["c", "Yaad rakhiye, bank kabhi bhi aapse OTP ya PIN nahi maangta", null],
    ],
  },
  {
    id: "sample-delivery", label: "genuine",
    voices: { c: "male2", u: "female1" },
    title: "Genuine: delivery asking for OTP",
    short: "Real delivery OTP",
    language: "Hinglish",
    lines: [
      ["c", "Hello madam, delivery hai, aapka parcel lekar gate par khada hoon", null],
      ["u", "Haan, aa rahi hoon", null],
      ["c", "Delivery confirm karne ke liye jo OTP aaya hai woh bata dijiye", null],
      ["u", "Haan, ek minute, main neeche aa gayi", null],
      ["c", "Thank you madam, aapka din shubh ho", null],
    ],
  },
];
