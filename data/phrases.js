// Phrase banks for generating labelled call transcripts.
//
// Every bank is split into `train` and `test` phrasings that never overlap,
// so the held-out test calls use wording the model has never seen.
// Phrasings were written by the authors from public descriptions of
// "digital arrest" and impersonation scams (police, CBI, customs, TRAI, ED,
// RBI personas). No real call recordings were used.

export const STAGES = ["authority", "fear", "isolation", "payment"];

export const SCAM = {
  authority: {
    train: [
      "Main CBI headquarters Delhi se Inspector Rajesh Sharma bol raha hoon",
      "मैं मुंबई क्राइम ब्रांच से सब-इंस्पेक्टर विक्रम सिंह बोल रहा हूँ",
      "This is Officer Mehta calling from the Narcotics Control Bureau",
      "Hum TRAI ke legal department se call kar rahe hain",
      "मैं प्रवर्तन निदेशालय यानी ED से बोल रहा हूँ, आपकी फाइल मेरे पास है",
      "I am speaking from the customs department at Mumbai airport",
      "Delhi police cyber cell ke DCP office se baat ho rahi hai aapki",
      "यह कॉल सुप्रीम कोर्ट के आदेश पर रिकॉर्ड की जा रही है",
      "This call is from the Telecom Regulatory Authority, your number is under investigation",
      "Main RBI ke fraud monitoring department se senior officer bol raha hoon",
    ],
    test: [
      "Hello, Inspector Arun Kumar, Central Bureau of Investigation se",
      "मैं नारकोटिक्स विभाग से इंस्पेक्टर बोल रहा हूँ",
      "I am calling from the cyber crime division of Mumbai police",
      "Customs office Kolkata se officer Pandey baat kar raha hoon",
      "मैं दूरसंचार विभाग की ओर से कॉल कर रहा हूँ",
      "This is the Enforcement Directorate, I am the investigating officer on your case",
      "Aapki call ab hamare senior IPS officer ko transfer ki ja rahi hai",
      "हम रिज़र्व बैंक की जांच टीम से बात कर रहे हैं",
    ],
  },
  fear: {
    train: [
      "Aapke Aadhaar card se ek bank account khula hai jo money laundering me use hua hai",
      "आपके नाम से एक पार्सल पकड़ा गया है जिसमें ड्रग्स और पांच पासपोर्ट मिले हैं",
      "There is an arrest warrant issued against you, an FIR has already been registered",
      "Aapka mobile number 17 cyber crime complaints me linked hai",
      "आपके खिलाफ गैर-जमानती वारंट जारी हो चुका है",
      "Your name has come up in a human trafficking and hawala case",
      "Agar aapne cooperate nahi kiya to local police aapko do ghante me arrest kar legi",
      "आपका नंबर दो घंटे में बंद कर दिया जाएगा और केस दर्ज होगा",
      "You are now under digital arrest until the investigation is complete",
      "Aapke bank account me 2 crore ka illegal transaction mila hai",
    ],
    test: [
      "Aapke naam par ek FIR darj hui hai, aapko giraftar kiya ja sakta hai",
      "आपके आधार कार्ड का इस्तेमाल मनी लॉन्ड्रिंग में हुआ है",
      "A parcel in your name containing MDMA was seized at the airport",
      "Aap abhi digital arrest me hain, aap kahin nahi ja sakte",
      "आपको सात साल की जेल हो सकती है",
      "Your SIM card has been used for illegal advertising and harassment messages",
      "Court ne aapke khilaf arrest warrant nikala hai",
      "आपके खाते से आतंकवादी फंडिंग के सबूत मिले हैं",
    ],
  },
  isolation: {
    train: [
      "Yeh case confidential hai, aap apni family me kisi ko nahi batayenge",
      "कॉल काटने की कोशिश मत करना, वरना तुरंत गिरफ्तारी होगी",
      "Stay on this video call and do not leave the room until we say so",
      "Kisi lawyer ya bank wale se baat mat karna, warna case aur kharab hoga",
      "अपने कमरे का दरवाज़ा बंद कर लीजिए और कैमरा ऑन रखिए",
      "This is a matter of national security, you cannot discuss it with anyone",
      "Skype download kijiye, aapka statement video par record hoga",
      "अगर किसी को बताया तो आपके परिवार को भी केस में शामिल किया जाएगा",
      "Do not disconnect, you are being monitored at all times",
      "Phone ko silent par mat rakhna, har ghante check-in karna hoga",
    ],
    test: [
      "Apne ghar walon ko is baare me kuch mat batana",
      "वीडियो कॉल चालू रखिए, आप हमारी निगरानी में हैं",
      "Do not tell your family or friends, this investigation is secret",
      "Call disconnect kiya to arrest team seedha aapke ghar aayegi",
      "किसी से भी बात करने की अनुमति नहीं है",
      "Please move to a private room and keep your camera on",
      "Yeh baat bank manager ko bhi nahi batani hai",
      "आपकी हर बातचीत रिकॉर्ड हो रही है, फोन मत रखिए",
    ],
  },
  payment: {
    train: [
      "Verification ke liye aapko apne saare paise RBI ke safe account me transfer karne honge",
      "जांच पूरी होने तक अपनी रकम इस सरकारी खाते में जमा कर दीजिए",
      "Transfer the amount to this verification account, it will be refunded in 24 hours",
      "Apni FD tod ke paisa is account number par RTGS kar dijiye",
      "मैं जो UPI आईडी भेज रहा हूँ उस पर तुरंत पेमेंट कीजिए",
      "Please share the OTP you just received to confirm your identity",
      "AnyDesk app install kijiye, hum aapka account verify karenge",
      "जमानत की राशि अभी ऑनलाइन जमा करनी होगी",
      "Pay the clearance fee now or the case will be forwarded to court",
      "Aapke account ka sara balance hamare escrow account me daalna hoga",
    ],
    test: [
      "Apne saare funds hamare secure account me transfer kijiye, jaanch ke baad wapas mil jayenge",
      "सत्यापन के लिए अपने खाते का बैलेंस इस खाते में भेजिए",
      "Send the money through RTGS to the account number I am sharing on WhatsApp",
      "Jo OTP aaya hai woh mujhe bata dijiye",
      "स्क्रीन शेयर करने वाला ऐप डाउनलोड कीजिए",
      "You must deposit a refundable security amount today",
      "Gold loan le lijiye aur woh paisa is account me daal dijiye",
      "यह राशि जमा करने के बाद आपका नाम केस से हटा दिया जाएगा",
    ],
  },
};

// Neutral lines a scam caller says between stages.
export const CALLER_FILLER = {
  train: [
    "Hello, kya meri baat aapse ho rahi hai?",
    "जी, आप ध्यान से सुनिए",
    "Please confirm your full name for our records",
    "Aapki date of birth bataiye",
    "Main aapko poora process samjha raha hoon",
    "ठीक है, आगे सुनिए",
  ],
  test: [
    "Hello, am I speaking to the account holder?",
    "Dhyan se suniye, main ek hi baar bataunga",
    "आपका पूरा नाम क्या है?",
    "Just answer my questions clearly",
  ],
};

// Lines from the person receiving the call. Shared by scam and genuine calls.
export const USER_LINES = {
  train: [
    "Haan ji, boliye",
    "जी हाँ, कौन बोल रहा है?",
    "Sir maine kuch nahi kiya",
    "मुझे कुछ समझ नहीं आ रहा",
    "Yes, who is this?",
    "Okay",
    "Theek hai",
    "Ji, samajh gaya",
  ],
  test: [
    "Haan, kaun?",
    "जी, बताइए",
    "But I have not done anything wrong",
    "Accha",
    "Main kya karun ab?",
    "हाँ, ठीक है",
  ],
};

// Genuine calls. Each scenario is a list of slots; each slot gives a
// training phrasing and a test phrasing, spoken by the caller (c) or user (u).
// Several scenarios are deliberately "hard negatives": genuine calls that use
// scam vocabulary (bank, OTP, police, arrest, transfer).
export const GENUINE = {
  bank_fraud_alert: [
    ["c", "Namaste, main aapke bank ki fraud prevention team se bol rahi hoon", "Good afternoon, this is the fraud monitoring team of your bank"],
    ["c", "Aapke card se abhi 12,000 rupaye ka transaction try hua hai, kya yeh aapne kiya?", "We noticed a transaction of 8,500 rupees on your card. Did you make it?"],
    ["u", "Nahi, maine nahi kiya", "No, that wasn't me"],
    ["c", "Theek hai, humne card block kar diya hai, naya card aapke ghar aa jayega", "Okay, we have blocked the card and a replacement will be sent to your registered address"],
    ["c", "Dhyan rakhiye, bank kabhi bhi aapse OTP ya PIN nahi maangta", "Please remember, the bank will never ask you for your OTP or PIN"],
    ["c", "Koi sawal ho to card ke peeche diye number par call kijiye", "For any questions, call the number printed on the back of your card"],
  ],
  delivery: [
    ["c", "Hello, main delivery boy bol raha hoon, aapka parcel aaya hai", "हैलो, आपका पार्सल आया है, मैं गेट पर हूँ"],
    ["c", "Aap ghar par hain? Main gali ke bahar hoon", "Can you tell me the landmark near your house?"],
    ["u", "Haan, aa jao, teesri manzil", "जी, ऊपर आ जाइए"],
    ["c", "Delivery ke liye OTP bata dijiye jo aapke phone par aaya hai", "डिलीवरी कन्फर्म करने के लिए ओटीपी बता दीजिए"],
    ["c", "Cash on delivery hai, 499 rupaye dene honge", "It's prepaid, you just need to sign"],
  ],
  police_verification: [
    ["c", "Main thane se constable bol raha hoon, aapke passport verification ke liye", "This is the local police station regarding your passport application verification"],
    ["c", "Kal subah dus baje apne documents lekar thane aa jaiye", "Please visit the police station tomorrow with your original documents"],
    ["u", "Theek hai sir, kaunse documents chahiye?", "Sure, which documents?"],
    ["c", "Aadhaar, address proof aur do photo le aaiye", "Bring your Aadhaar, address proof and two photographs"],
    ["c", "Koi fees nahi hai, bas verification hai", "There is no fee for this, it is only a verification"],
  ],
  friend_discussing_scam: [
    ["c", "Arre tune news dekhi? Ek uncle ko CBI wale ban ke digital arrest kar diya", "Did you hear, someone in our society got a call from fake CBI officers"],
    ["c", "Unhone bola ki money laundering ka case hai aur arrest ho jayega", "They told him there was an arrest warrant and kept him on a video call"],
    ["u", "Phir kya hua?", "What happened then?"],
    ["c", "Unhone 40 lakh transfer kar diye, baad me pata chala scam tha", "He almost transferred his savings, but his son stopped him"],
    ["c", "Isliye mummy papa ko bata dena, police kabhi call par arrest nahi karti", "Tell your parents, police never arrest anyone over a video call"],
  ],
  friend_splitting_bill: [
    ["c", "Bhai, kal ki party ke paise bhej de, 500 tera share hai", "Hey, can you send your share for the trip, it's 1,200 rupees"],
    ["c", "Mera UPI wahi purana hai, Google Pay kar dena", "Send it to my usual UPI ID when you're free"],
    ["u", "Haan, shaam tak bhej dunga", "Okay, will do it tonight"],
    ["c", "Aur Sunday ko milte hain", "See you on Sunday then"],
  ],
  insurance_renewal: [
    ["c", "Namaste, aapki car insurance policy agle hafte expire ho rahi hai", "Hello, your health insurance policy is due for renewal this month"],
    ["c", "Renewal aap official app ya website se kar sakte hain", "You can renew it from the official app or at our branch"],
    ["u", "Premium kitna hai?", "What is the premium?"],
    ["c", "Is saal premium 8,200 rupaye hai", "The premium this year is 12,400 rupees"],
    ["c", "Koi jaldi nahi hai, aap soch kar bata dijiye", "No hurry, you can decide by the due date"],
  ],
  clinic_reminder: [
    ["c", "Main Dr. Gupta ke clinic se bol rahi hoon, kal aapka appointment hai", "This is the clinic calling to confirm your appointment tomorrow"],
    ["c", "Apni purani reports saath le aaiye", "Please bring your previous reports"],
    ["u", "Ji, kitne baje?", "What time?"],
    ["c", "Subah gyarah baje, khali pet aana hai", "Eleven in the morning, please come fasting"],
  ],
  telecom_callback: [
    ["c", "Main aapke mobile network ki customer care se bol raha hoon, aapki complaint ke baare me", "This is customer care calling back about your network complaint"],
    ["c", "Aapke area me tower ka kaam chal raha hai, kal tak theek ho jayega", "There was tower maintenance in your area, it should be fixed by tomorrow"],
    ["u", "Theek hai, thank you", "Okay, thanks"],
    ["c", "Agar fir bhi problem ho to app me complaint dobara daal dijiye", "If the problem continues, please raise a new complaint in the app"],
  ],
};

// Everyday conversation, used only as "normal speech" examples when training
// the classifier. Never used to build test calls.
export const EVERYDAY = [
  "Kal subah kitne baje aana hai?", "What time should I come tomorrow?", "कल शाम को मिलते हैं",
  "Main raste me hoon, das minute me pahunch jaunga", "I'm on my way, I'll be there in ten minutes",
  "खाना खा लिया?", "Did you have lunch?", "Mummy ki tabiyat kaisi hai ab?",
  "Please bring the documents when you come", "Apne saath ID proof le aana", "आधार कार्ड की कॉपी लेते आना",
  "Your order has been shipped and will arrive on Friday", "Aapka order kal deliver ho jayega", "पार्सल नीचे गार्ड के पास रख दीजिए",
  "Can you share the location on WhatsApp?", "Location bhej do, main aa raha hoon", "गेट नंबर दो पर आ जाइए",
  "The meeting has been moved to Thursday", "Office me aaj late ho jayega", "मीटिंग कल सुबह दस बजे है",
  "I'll transfer my share of the rent tonight", "Kiraya maine bhej diya hai, check kar lena", "बिजली का बिल मैंने भर दिया है",
  "Your appointment is confirmed for next Monday", "Doctor ne do din baad bulaya hai", "रिपोर्ट कल तक आ जाएगी",
  "Thank you for calling, have a good day", "Koi baat nahi, baad me baat karte hain", "ठीक है, फिर बात करते हैं",
  "The bank branch is closed on Sunday", "Branch me jaakar passbook update karwa lena", "बैंक में नया खाता खुलवाना है",
  "Your complaint has been registered and will be resolved soon", "Network ki problem kal tak theek ho jayegi", "हम आपकी शिकायत जल्दी हल करेंगे",
  "Can you hear me? The line is breaking", "Awaaz nahi aa rahi, dobara call karta hoon", "हैलो, आवाज़ आ रही है?",
  "Yes, that's fine", "Haan, chalega", "जी बिलकुल",
  "I didn't get it, can you repeat?", "Ek baar fir se bataiye", "समझ गया, धन्यवाद",
  "We are calling to confirm your booking", "Aapki ticket confirm ho gayi hai", "आपकी सीट कन्फर्म हो गई है",
  "The police verification for the flat is done", "Society ke guard ne bola ki courier aaya tha", "कूरियर वाला फोन कर रहा था",
  "Please don't forget to pay the school fees", "Bachon ki fees is hafte bharni hai", "फीस ऑनलाइन जमा हो गई",
];
