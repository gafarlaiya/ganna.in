/* ganna.in farmer login: mobile with a WhatsApp OTP (via DoubleTick) and email signup for sugarcane updates.
   Shared account with mangomastery.com. Backend: Supabase function mango-auth (site "ganna", codes GN-1234). */
(function(){
var API='https://filbmvtclfcrrvxckema.supabase.co/functions/v1/mango-auth';
var PAGE_LANG=document.documentElement.lang||'gu';
var IS_SHELL=/^\/(login|account)\/?$/.test(location.pathname);
var LANGS=['gu','hi','mr','pa','kn','en'];
try{ if(!IS_SHELL && LANGS.indexOf(PAGE_LANG)>=0) localStorage.setItem('gn_lang',PAGE_LANG); }catch(x){}
var LG=PAGE_LANG;
if(IS_SHELL){ var q=new URLSearchParams(location.search).get('lang'), st=null; try{st=localStorage.getItem('gn_lang')}catch(x){}
  LG=LANGS.indexOf(q)>=0?q:(LANGS.indexOf(st)>=0?st:'gu'); document.documentElement.lang=LG; }
var S={
gu:{login:'લૉગિન',acct:'મારું ખાતું',h1:'ganna.in માં લૉગિન',lead:'તમારી વિગત સાચવો અને ફરી ફોર્મ ભર્યા વગર સલાહ મેળવો.',tabMob:'📱 મોબાઇલ (WhatsApp)',tabMail:'✉️ ઈમેઇલથી જોડાઓ',
 mobL:'તમારો WhatsApp મોબાઇલ નંબર',mobPh:'દા.ત. 98765 43210',getCode:'WhatsApp પર લૉગિન કોડ મેળવો',noSms:'અમે SMS નથી મોકલતા. તમે અમને WhatsApp પર કોડ મોકલશો અને અમે WhatsApp પર જ OTP મોકલીશું.',
 s1:'આ કોડ WhatsApp પર મોકલો',waBtn:'WhatsApp ખોલો અને મોકલો',sendNote:'મેસેજ તૈયાર હશે, ફક્ત "Send" દબાવો. +91 99787 91167 પર, {n} નંબરથી જ મોકલવો.',s2:'WhatsApp પર આવેલો 6 આંકડાનો OTP અહીં લખો',
 wait:'⏳ તમારા મેસેજની રાહ જોઈએ છીએ…',otpSent:'✅ OTP WhatsApp પર મોકલ્યો છે.',otpFail:'OTP મોકલી ન શકાયો. ફરી પ્રયત્ન કરો અથવા 99787 91167 પર ફોન કરો.',expired:'કોડ જૂનો થયો. નવો કોડ મેળવો.',
 loginBtn:'લૉગિન કરો',back:'← નંબર બદલો / નવો કોડ',errMob:'10 આંકડાનો સાચો મોબાઇલ નંબર લખો',errOtp6:'6 આંકડાનો OTP લખો',errWrong:'OTP ખોટો છે.',errOtpExp:'OTP જૂનો થયો. નવો કોડ મેળવો.',
 errNoOtp:'હજુ OTP મોકલાયો નથી. પહેલાં WhatsApp પર કોડ મોકલો.',errNet:'નેટવર્ક ભૂલ. ફરી પ્રયત્ન કરો.',tooMany:'ઘણા પ્રયત્ન થયા. એક કલાક પછી ફરી કરો.',
 nameL:'તમારું નામ',emailL:'ઈમેઇલ',villageL:'ગામ',districtL:'તાલુકો / જિલ્લો (મરજિયાત)',newsT:'🌾 શેરડીની ખેતી માટે ઈમેઇલ અપડેટ્સ',
 newsP:'આ ઈમેઇલ પર અમે શેરડીની સારી ખેતી માટે શૈક્ષણિક માહિતી, જ્ઞાન, સિઝન પ્રમાણે માવજત અને નવી માહિતી સમયાંતરે મોકલીશું.',
 consent:'હું સંમતિ આપું છું કે Gujarat Bio Organics (ganna.in) મને આ ઈમેઇલ પર શેરડીની સારી ખેતી માટે શૈક્ષણિક માહિતી, જ્ઞાન અને અપડેટ્સ સમયાંતરે મોકલે. હું ગમે ત્યારે બંધ કરી શકું છું.',
 join:'જોડાઓ',joinNote:'બીજા ફોન પર લૉગિન કરવા મોબાઇલ (WhatsApp) વાપરો.',okT:'✅ તમે જોડાઈ ગયા',okMsg:'શેરડીની ખેતી માટેની માહિતી તમારા ઈમેઇલ પર આવશે.',okExist:'આ ઈમેઇલ પહેલેથી જોડાયેલ છે, અપડેટ્સ ચાલુ રહેશે. ખાતામાં લૉગિન કરવા મોબાઇલ (WhatsApp) વાપરો.',
 errName:'તમારું નામ લખો',errEmail:'સાચો ઈમેઇલ લખો',errConsent:'ઈમેઇલ અપડેટ્સ માટે સંમતિ પર ટિક કરો',errJoin:'જોડાઈ ન શકાયું. ફરી પ્રયત્ન કરો.',
 hello:'નમસ્તે',acctSub:'તમારું ganna.in ખાતું',profT:'મારી વિગત',save:'સાચવો',saved:'✅ સાચવ્યું',noMob:'મોબાઇલ નથી ઉમેર્યો',addMob:'WhatsApp થી ઉમેરો',
 addEmailP:'ઈમેઇલ ઉમેરો અને શેરડીની સારી ખેતી માટે માહિતી સમયાંતરે મેળવો.',addEmail:'ઈમેઇલ ઉમેરો',newsToggle:'શેરડીની ખેતી માટે માહિતી અને અપડેટ્સ આ ઈમેઇલ પર મેળવવી છે',
 linksT:'ઝડપી લિંક',l1:'ડોઝ શેડ્યૂલ અને Calculator',l2:'Immunity Sugarcane Program',l3:'ખેડૂત પરિણામો',l4:'WhatsApp પર ફોટો મોકલો',logout:'લૉગ આઉટ',loading:'⏳ લોડ થાય છે…',privacy:'તમારો નંબર ફક્ત લૉગિન અને તમારો સંપર્ક કરવા વપરાશે.',
 waText:'ganna.in લૉગિન કોડ: '},
hi:{login:'लॉगिन',acct:'मेरा खाता',h1:'ganna.in में लॉगिन',lead:'अपनी जानकारी सेव करें और बिना फ़ॉर्म भरे सलाह पाएं.',tabMob:'📱 मोबाइल (WhatsApp)',tabMail:'✉️ ईमेल से जुड़ें',
 mobL:'आपका WhatsApp मोबाइल नंबर',mobPh:'जैसे 98765 43210',getCode:'WhatsApp पर लॉगिन कोड लें',noSms:'हम SMS नहीं भेजते. आप हमें WhatsApp पर कोड भेजेंगे और हम WhatsApp पर ही OTP भेजेंगे.',
 s1:'यह कोड WhatsApp पर भेजें',waBtn:'WhatsApp खोलें और भेजें',sendNote:'मैसेज तैयार होगा, बस "Send" दबाएं. +91 99787 91167 पर, {n} नंबर से ही भेजें.',s2:'WhatsApp पर आया 6 अंकों का OTP यहाँ लिखें',
 wait:'⏳ आपके मैसेज का इंतज़ार है…',otpSent:'✅ OTP WhatsApp पर भेजा गया है.',otpFail:'OTP नहीं भेजा जा सका. फिर कोशिश करें या 99787 91167 पर फ़ोन करें.',expired:'कोड पुराना हो गया. नया कोड लें.',
 loginBtn:'लॉगिन करें',back:'← नंबर बदलें / नया कोड',errMob:'10 अंकों का सही मोबाइल नंबर लिखें',errOtp6:'6 अंकों का OTP लिखें',errWrong:'OTP गलत है.',errOtpExp:'OTP पुराना हो गया. नया कोड लें.',
 errNoOtp:'अभी OTP नहीं भेजा गया. पहले WhatsApp पर कोड भेजें.',errNet:'नेटवर्क त्रुटि. फिर कोशिश करें.',tooMany:'बहुत कोशिशें हुईं. एक घंटे बाद फिर करें.',
 nameL:'आपका नाम',emailL:'ईमेल',villageL:'गाँव',districtL:'तहसील / ज़िला (वैकल्पिक)',newsT:'🌾 गन्ने की खेती के लिए ईमेल अपडेट',
 newsP:'इस ईमेल पर हम गन्ने की बेहतर खेती के लिए शैक्षणिक जानकारी, ज्ञान, मौसम के अनुसार देखभाल और नई जानकारी समय-समय पर भेजेंगे.',
 consent:'मैं सहमति देता/देती हूँ कि Gujarat Bio Organics (ganna.in) मुझे इस ईमेल पर गन्ने की बेहतर खेती के लिए शैक्षणिक जानकारी, ज्ञान और अपडेट समय-समय पर भेजे. मैं कभी भी बंद कर सकता/सकती हूँ.',
 join:'जुड़ें',joinNote:'दूसरे फ़ोन पर लॉगिन के लिए मोबाइल (WhatsApp) इस्तेमाल करें.',okT:'✅ आप जुड़ गए',okMsg:'गन्ने की खेती की जानकारी आपके ईमेल पर आएगी.',okExist:'यह ईमेल पहले से जुड़ा है, अपडेट जारी रहेंगे. खाते में लॉगिन के लिए मोबाइल (WhatsApp) इस्तेमाल करें.',
 errName:'अपना नाम लिखें',errEmail:'सही ईमेल लिखें',errConsent:'ईमेल अपडेट के लिए सहमति पर टिक करें',errJoin:'जुड़ नहीं सके. फिर कोशिश करें.',
 hello:'नमस्ते',acctSub:'आपका ganna.in खाता',profT:'मेरी जानकारी',save:'सेव करें',saved:'✅ सेव हो गया',noMob:'मोबाइल नहीं जोड़ा',addMob:'WhatsApp से जोड़ें',
 addEmailP:'ईमेल जोड़ें और गन्ने की बेहतर खेती की जानकारी पाएं.',addEmail:'ईमेल जोड़ें',newsToggle:'गन्ने की खेती की जानकारी और अपडेट इस ईमेल पर चाहिए',
 linksT:'ज़रूरी लिंक',l1:'डोज़ शेड्यूल और कैलकुलेटर',l2:'Immunity Sugarcane Program',l3:'किसानों के परिणाम',l4:'WhatsApp पर फ़ोटो भेजें',logout:'लॉग आउट',loading:'⏳ लोड हो रहा है…',privacy:'आपका नंबर केवल लॉगिन और आपसे संपर्क के लिए इस्तेमाल होगा.',
 waText:'ganna.in लॉगिन कोड: '},
mr:{login:'लॉगिन',acct:'माझे खाते',h1:'ganna.in मध्ये लॉगिन',lead:'तुमची माहिती जतन करा आणि पुन्हा फॉर्म न भरता सल्ला मिळवा.',tabMob:'📱 मोबाइल (WhatsApp)',tabMail:'✉️ ईमेलने जोडा',
 mobL:'तुमचा WhatsApp मोबाइल नंबर',mobPh:'उदा. 98765 43210',getCode:'WhatsApp वर लॉगिन कोड मिळवा',noSms:'आम्ही SMS पाठवत नाही. तुम्ही आम्हाला WhatsApp वर कोड पाठवाल आणि आम्ही WhatsApp वरच OTP पाठवू.',
 s1:'हा कोड WhatsApp वर पाठवा',waBtn:'WhatsApp उघडा आणि पाठवा',sendNote:'मेसेज तयार असेल, फक्त "Send" दाबा. +91 99787 91167 वर, {n} नंबरवरूनच पाठवा.',s2:'WhatsApp वर आलेला 6 अंकी OTP इथे लिहा',
 wait:'⏳ तुमच्या मेसेजची वाट पाहत आहोत…',otpSent:'✅ OTP WhatsApp वर पाठवला आहे.',otpFail:'OTP पाठवता आला नाही. पुन्हा प्रयत्न करा किंवा 99787 91167 वर फोन करा.',expired:'कोड जुना झाला. नवीन कोड घ्या.',
 loginBtn:'लॉगिन करा',back:'← नंबर बदला / नवीन कोड',errMob:'10 अंकी योग्य मोबाइल नंबर लिहा',errOtp6:'6 अंकी OTP लिहा',errWrong:'OTP चुकीचा आहे.',errOtpExp:'OTP जुना झाला. नवीन कोड घ्या.',
 errNoOtp:'अजून OTP पाठवला नाही. आधी WhatsApp वर कोड पाठवा.',errNet:'नेटवर्क त्रुटी. पुन्हा प्रयत्न करा.',tooMany:'खूप प्रयत्न झाले. एका तासाने पुन्हा करा.',
 nameL:'तुमचे नाव',emailL:'ईमेल',villageL:'गाव',districtL:'तालुका / जिल्हा (ऐच्छिक)',newsT:'🌾 ऊस शेतीसाठी ईमेल अपडेट्स',
 newsP:'या ईमेलवर आम्ही चांगल्या ऊस शेतीसाठी शैक्षणिक माहिती, ज्ञान, हंगामानुसार काळजी आणि नवीन माहिती वेळोवेळी पाठवू.',
 consent:'मी संमती देतो/देते की Gujarat Bio Organics (ganna.in) मला या ईमेलवर चांगल्या ऊस शेतीसाठी शैक्षणिक माहिती, ज्ञान आणि अपडेट्स वेळोवेळी पाठवेल. मी कधीही बंद करू शकतो/शकते.',
 join:'जोडा',joinNote:'दुसऱ्या फोनवर लॉगिनसाठी मोबाइल (WhatsApp) वापरा.',okT:'✅ तुम्ही जोडले गेलात',okMsg:'ऊस शेतीची माहिती तुमच्या ईमेलवर येईल.',okExist:'हा ईमेल आधीच जोडलेला आहे, अपडेट्स चालू राहतील. खात्यात लॉगिनसाठी मोबाइल (WhatsApp) वापरा.',
 errName:'तुमचे नाव लिहा',errEmail:'योग्य ईमेल लिहा',errConsent:'ईमेल अपडेट्ससाठी संमतीवर टिक करा',errJoin:'जोडता आले नाही. पुन्हा प्रयत्न करा.',
 hello:'नमस्कार',acctSub:'तुमचे ganna.in खाते',profT:'माझी माहिती',save:'जतन करा',saved:'✅ जतन झाले',noMob:'मोबाइल जोडलेला नाही',addMob:'WhatsApp ने जोडा',
 addEmailP:'ईमेल जोडा आणि चांगल्या ऊस शेतीची माहिती मिळवा.',addEmail:'ईमेल जोडा',newsToggle:'ऊस शेतीची माहिती आणि अपडेट्स या ईमेलवर हवेत',
 linksT:'महत्त्वाच्या लिंक',l1:'डोस वेळापत्रक आणि कॅल्क्युलेटर',l2:'Immunity Sugarcane Program',l3:'शेतकऱ्यांचे निकाल',l4:'WhatsApp वर फोटो पाठवा',logout:'लॉग आउट',loading:'⏳ लोड होत आहे…',privacy:'तुमचा नंबर फक्त लॉगिन आणि तुमच्याशी संपर्कासाठी वापरला जाईल.',
 waText:'ganna.in लॉगिन कोड: '},
pa:{login:'ਲੌਗਇਨ',acct:'ਮੇਰਾ ਖਾਤਾ',h1:'ganna.in ਵਿੱਚ ਲੌਗਇਨ',lead:'ਆਪਣੀ ਜਾਣਕਾਰੀ ਸੰਭਾਲੋ ਅਤੇ ਬਿਨਾਂ ਫਾਰਮ ਭਰੇ ਸਲਾਹ ਲਓ.',tabMob:'📱 ਮੋਬਾਈਲ (WhatsApp)',tabMail:'✉️ ਈਮੇਲ ਨਾਲ ਜੁੜੋ',
 mobL:'ਤੁਹਾਡਾ WhatsApp ਮੋਬਾਈਲ ਨੰਬਰ',mobPh:'ਜਿਵੇਂ 98765 43210',getCode:'WhatsApp ਤੇ ਲੌਗਇਨ ਕੋਡ ਲਓ',noSms:'ਅਸੀਂ SMS ਨਹੀਂ ਭੇਜਦੇ. ਤੁਸੀਂ ਸਾਨੂੰ WhatsApp ਤੇ ਕੋਡ ਭੇਜੋਗੇ ਅਤੇ ਅਸੀਂ WhatsApp ਤੇ ਹੀ OTP ਭੇਜਾਂਗੇ.',
 s1:'ਇਹ ਕੋਡ WhatsApp ਤੇ ਭੇਜੋ',waBtn:'WhatsApp ਖੋਲ੍ਹੋ ਅਤੇ ਭੇਜੋ',sendNote:'ਮੈਸੇਜ ਤਿਆਰ ਹੋਵੇਗਾ, ਬੱਸ "Send" ਦਬਾਓ. +91 99787 91167 ਤੇ, {n} ਨੰਬਰ ਤੋਂ ਹੀ ਭੇਜੋ.',s2:'WhatsApp ਤੇ ਆਇਆ 6 ਅੰਕਾਂ ਦਾ OTP ਇੱਥੇ ਲਿਖੋ',
 wait:'⏳ ਤੁਹਾਡੇ ਮੈਸੇਜ ਦੀ ਉਡੀਕ ਹੈ…',otpSent:'✅ OTP WhatsApp ਤੇ ਭੇਜਿਆ ਗਿਆ ਹੈ.',otpFail:'OTP ਨਹੀਂ ਭੇਜਿਆ ਜਾ ਸਕਿਆ. ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ ਜਾਂ 99787 91167 ਤੇ ਫੋਨ ਕਰੋ.',expired:'ਕੋਡ ਪੁਰਾਣਾ ਹੋ ਗਿਆ. ਨਵਾਂ ਕੋਡ ਲਓ.',
 loginBtn:'ਲੌਗਇਨ ਕਰੋ',back:'← ਨੰਬਰ ਬਦਲੋ / ਨਵਾਂ ਕੋਡ',errMob:'10 ਅੰਕਾਂ ਦਾ ਸਹੀ ਮੋਬਾਈਲ ਨੰਬਰ ਲਿਖੋ',errOtp6:'6 ਅੰਕਾਂ ਦਾ OTP ਲਿਖੋ',errWrong:'OTP ਗਲਤ ਹੈ.',errOtpExp:'OTP ਪੁਰਾਣਾ ਹੋ ਗਿਆ. ਨਵਾਂ ਕੋਡ ਲਓ.',
 errNoOtp:'ਅਜੇ OTP ਨਹੀਂ ਭੇਜਿਆ ਗਿਆ. ਪਹਿਲਾਂ WhatsApp ਤੇ ਕੋਡ ਭੇਜੋ.',errNet:'ਨੈੱਟਵਰਕ ਗਲਤੀ. ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ.',tooMany:'ਬਹੁਤ ਕੋਸ਼ਿਸ਼ਾਂ ਹੋ ਗਈਆਂ. ਇੱਕ ਘੰਟੇ ਬਾਅਦ ਕਰੋ.',
 nameL:'ਤੁਹਾਡਾ ਨਾਮ',emailL:'ਈਮੇਲ',villageL:'ਪਿੰਡ',districtL:'ਤਹਿਸੀਲ / ਜ਼ਿਲ੍ਹਾ (ਵਿਕਲਪਿਕ)',newsT:'🌾 ਗੰਨੇ ਦੀ ਖੇਤੀ ਲਈ ਈਮੇਲ ਅੱਪਡੇਟ',
 newsP:'ਇਸ ਈਮੇਲ ਤੇ ਅਸੀਂ ਗੰਨੇ ਦੀ ਵਧੀਆ ਖੇਤੀ ਲਈ ਸਿੱਖਿਆ ਵਾਲੀ ਜਾਣਕਾਰੀ, ਗਿਆਨ, ਮੌਸਮ ਮੁਤਾਬਕ ਦੇਖਭਾਲ ਅਤੇ ਨਵੀਂ ਜਾਣਕਾਰੀ ਸਮੇਂ-ਸਮੇਂ ਤੇ ਭੇਜਾਂਗੇ.',
 consent:'ਮੈਂ ਸਹਿਮਤੀ ਦਿੰਦਾ/ਦਿੰਦੀ ਹਾਂ ਕਿ Gujarat Bio Organics (ganna.in) ਮੈਨੂੰ ਇਸ ਈਮੇਲ ਤੇ ਗੰਨੇ ਦੀ ਵਧੀਆ ਖੇਤੀ ਲਈ ਸਿੱਖਿਆ ਵਾਲੀ ਜਾਣਕਾਰੀ, ਗਿਆਨ ਅਤੇ ਅੱਪਡੇਟ ਸਮੇਂ-ਸਮੇਂ ਤੇ ਭੇਜੇ. ਮੈਂ ਕਦੇ ਵੀ ਬੰਦ ਕਰ ਸਕਦਾ/ਸਕਦੀ ਹਾਂ.',
 join:'ਜੁੜੋ',joinNote:'ਦੂਜੇ ਫੋਨ ਤੇ ਲੌਗਇਨ ਲਈ ਮੋਬਾਈਲ (WhatsApp) ਵਰਤੋ.',okT:'✅ ਤੁਸੀਂ ਜੁੜ ਗਏ',okMsg:'ਗੰਨੇ ਦੀ ਖੇਤੀ ਦੀ ਜਾਣਕਾਰੀ ਤੁਹਾਡੀ ਈਮੇਲ ਤੇ ਆਵੇਗੀ.',okExist:'ਇਹ ਈਮੇਲ ਪਹਿਲਾਂ ਹੀ ਜੁੜੀ ਹੈ, ਅੱਪਡੇਟ ਜਾਰੀ ਰਹਿਣਗੇ. ਖਾਤੇ ਵਿੱਚ ਲੌਗਇਨ ਲਈ ਮੋਬਾਈਲ (WhatsApp) ਵਰਤੋ.',
 errName:'ਆਪਣਾ ਨਾਮ ਲਿਖੋ',errEmail:'ਸਹੀ ਈਮੇਲ ਲਿਖੋ',errConsent:'ਈਮੇਲ ਅੱਪਡੇਟ ਲਈ ਸਹਿਮਤੀ ਤੇ ਟਿੱਕ ਕਰੋ',errJoin:'ਜੁੜ ਨਹੀਂ ਸਕੇ. ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ.',
 hello:'ਸਤ ਸ੍ਰੀ ਅਕਾਲ',acctSub:'ਤੁਹਾਡਾ ganna.in ਖਾਤਾ',profT:'ਮੇਰੀ ਜਾਣਕਾਰੀ',save:'ਸੰਭਾਲੋ',saved:'✅ ਸੰਭਾਲਿਆ ਗਿਆ',noMob:'ਮੋਬਾਈਲ ਨਹੀਂ ਜੋੜਿਆ',addMob:'WhatsApp ਨਾਲ ਜੋੜੋ',
 addEmailP:'ਈਮੇਲ ਜੋੜੋ ਅਤੇ ਗੰਨੇ ਦੀ ਵਧੀਆ ਖੇਤੀ ਦੀ ਜਾਣਕਾਰੀ ਲਓ.',addEmail:'ਈਮੇਲ ਜੋੜੋ',newsToggle:'ਗੰਨੇ ਦੀ ਖੇਤੀ ਦੀ ਜਾਣਕਾਰੀ ਅਤੇ ਅੱਪਡੇਟ ਇਸ ਈਮੇਲ ਤੇ ਚਾਹੀਦੇ ਹਨ',
 linksT:'ਜ਼ਰੂਰੀ ਲਿੰਕ',l1:'ਡੋਜ਼ ਸ਼ਡਿਊਲ ਅਤੇ ਕੈਲਕੁਲੇਟਰ',l2:'Immunity Sugarcane Program',l3:'ਕਿਸਾਨਾਂ ਦੇ ਨਤੀਜੇ',l4:'WhatsApp ਤੇ ਫੋਟੋ ਭੇਜੋ',logout:'ਲੌਗ ਆਊਟ',loading:'⏳ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ…',privacy:'ਤੁਹਾਡਾ ਨੰਬਰ ਸਿਰਫ਼ ਲੌਗਇਨ ਅਤੇ ਤੁਹਾਡੇ ਨਾਲ ਸੰਪਰਕ ਲਈ ਵਰਤਿਆ ਜਾਵੇਗਾ.',
 waText:'ganna.in ਲੌਗਇਨ ਕੋਡ: '},
kn:{login:'ಲಾಗಿನ್',acct:'ನನ್ನ ಖಾತೆ',h1:'ganna.in ಗೆ ಲಾಗಿನ್',lead:'ನಿಮ್ಮ ವಿವರ ಉಳಿಸಿ, ಮತ್ತೆ ಫಾರ್ಮ್ ತುಂಬದೆ ಸಲಹೆ ಪಡೆಯಿರಿ.',tabMob:'📱 ಮೊಬೈಲ್ (WhatsApp)',tabMail:'✉️ ಇಮೇಲ್ ಮೂಲಕ ಸೇರಿ',
 mobL:'ನಿಮ್ಮ WhatsApp ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',mobPh:'ಉದಾ. 98765 43210',getCode:'WhatsApp ನಲ್ಲಿ ಲಾಗಿನ್ ಕೋಡ್ ಪಡೆಯಿರಿ',noSms:'ನಾವು SMS ಕಳುಹಿಸುವುದಿಲ್ಲ. ನೀವು ನಮಗೆ WhatsApp ನಲ್ಲಿ ಕೋಡ್ ಕಳುಹಿಸಿ, ನಾವು WhatsApp ನಲ್ಲೇ OTP ಕಳುಹಿಸುತ್ತೇವೆ.',
 s1:'ಈ ಕೋಡ್ ಅನ್ನು WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಿ',waBtn:'WhatsApp ತೆರೆದು ಕಳುಹಿಸಿ',sendNote:'ಸಂದೇಶ ಸಿದ್ಧವಾಗಿರುತ್ತದೆ, "Send" ಒತ್ತಿ. +91 99787 91167 ಗೆ, {n} ಸಂಖ್ಯೆಯಿಂದಲೇ ಕಳುಹಿಸಿ.',s2:'WhatsApp ನಲ್ಲಿ ಬಂದ 6 ಅಂಕಿಯ OTP ಇಲ್ಲಿ ಬರೆಯಿರಿ',
 wait:'⏳ ನಿಮ್ಮ ಸಂದೇಶಕ್ಕಾಗಿ ಕಾಯುತ್ತಿದ್ದೇವೆ…',otpSent:'✅ OTP WhatsApp ನಲ್ಲಿ ಕಳುಹಿಸಲಾಗಿದೆ.',otpFail:'OTP ಕಳುಹಿಸಲು ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ ಅಥವಾ 99787 91167 ಗೆ ಕರೆ ಮಾಡಿ.',expired:'ಕೋಡ್ ಅವಧಿ ಮೀರಿದೆ. ಹೊಸ ಕೋಡ್ ಪಡೆಯಿರಿ.',
 loginBtn:'ಲಾಗಿನ್ ಮಾಡಿ',back:'← ಸಂಖ್ಯೆ ಬದಲಿಸಿ / ಹೊಸ ಕೋಡ್',errMob:'10 ಅಂಕಿಯ ಸರಿಯಾದ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಬರೆಯಿರಿ',errOtp6:'6 ಅಂಕಿಯ OTP ಬರೆಯಿರಿ',errWrong:'OTP ತಪ್ಪಾಗಿದೆ.',errOtpExp:'OTP ಅವಧಿ ಮೀರಿದೆ. ಹೊಸ ಕೋಡ್ ಪಡೆಯಿರಿ.',
 errNoOtp:'ಇನ್ನೂ OTP ಕಳುಹಿಸಿಲ್ಲ. ಮೊದಲು WhatsApp ನಲ್ಲಿ ಕೋಡ್ ಕಳುಹಿಸಿ.',errNet:'ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',tooMany:'ತುಂಬಾ ಪ್ರಯತ್ನಗಳು. ಒಂದು ಗಂಟೆ ನಂತರ ಪ್ರಯತ್ನಿಸಿ.',
 nameL:'ನಿಮ್ಮ ಹೆಸರು',emailL:'ಇಮೇಲ್',villageL:'ಗ್ರಾಮ',districtL:'ತಾಲೂಕು / ಜಿಲ್ಲೆ (ಐಚ್ಛಿಕ)',newsT:'🌾 ಕಬ್ಬು ಬೇಸಾಯಕ್ಕೆ ಇಮೇಲ್ ಅಪ್‌ಡೇಟ್‌ಗಳು',
 newsP:'ಈ ಇಮೇಲ್‌ಗೆ ಉತ್ತಮ ಕಬ್ಬು ಬೇಸಾಯಕ್ಕಾಗಿ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ, ಜ್ಞಾನ, ಋತುವಿನ ಆರೈಕೆ ಮತ್ತು ಹೊಸ ಮಾಹಿತಿಯನ್ನು ಆಗಾಗ ಕಳುಹಿಸುತ್ತೇವೆ.',
 consent:'Gujarat Bio Organics (ganna.in) ನನಗೆ ಈ ಇಮೇಲ್‌ಗೆ ಉತ್ತಮ ಕಬ್ಬು ಬೇಸಾಯಕ್ಕಾಗಿ ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿ, ಜ್ಞಾನ ಮತ್ತು ಅಪ್‌ಡೇಟ್‌ಗಳನ್ನು ಆಗಾಗ ಕಳುಹಿಸಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ. ನಾನು ಯಾವಾಗ ಬೇಕಾದರೂ ನಿಲ್ಲಿಸಬಹುದು.',
 join:'ಸೇರಿ',joinNote:'ಬೇರೆ ಫೋನ್‌ನಲ್ಲಿ ಲಾಗಿನ್‌ಗೆ ಮೊಬೈಲ್ (WhatsApp) ಬಳಸಿ.',okT:'✅ ನೀವು ಸೇರಿದ್ದೀರಿ',okMsg:'ಕಬ್ಬು ಬೇಸಾಯದ ಮಾಹಿತಿ ನಿಮ್ಮ ಇಮೇಲ್‌ಗೆ ಬರುತ್ತದೆ.',okExist:'ಈ ಇಮೇಲ್ ಈಗಾಗಲೇ ಸೇರಿದೆ, ಅಪ್‌ಡೇಟ್‌ಗಳು ಮುಂದುವರಿಯುತ್ತವೆ. ಖಾತೆಗೆ ಲಾಗಿನ್‌ಗೆ ಮೊಬೈಲ್ (WhatsApp) ಬಳಸಿ.',
 errName:'ನಿಮ್ಮ ಹೆಸರು ಬರೆಯಿರಿ',errEmail:'ಸರಿಯಾದ ಇಮೇಲ್ ಬರೆಯಿರಿ',errConsent:'ಇಮೇಲ್ ಅಪ್‌ಡೇಟ್‌ಗೆ ಒಪ್ಪಿಗೆಗೆ ಟಿಕ್ ಮಾಡಿ',errJoin:'ಸೇರಲು ಆಗಲಿಲ್ಲ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
 hello:'ನಮಸ್ಕಾರ',acctSub:'ನಿಮ್ಮ ganna.in ಖಾತೆ',profT:'ನನ್ನ ವಿವರ',save:'ಉಳಿಸಿ',saved:'✅ ಉಳಿಸಲಾಗಿದೆ',noMob:'ಮೊಬೈಲ್ ಸೇರಿಸಿಲ್ಲ',addMob:'WhatsApp ಮೂಲಕ ಸೇರಿಸಿ',
 addEmailP:'ಇಮೇಲ್ ಸೇರಿಸಿ ಮತ್ತು ಉತ್ತಮ ಕಬ್ಬು ಬೇಸಾಯದ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.',addEmail:'ಇಮೇಲ್ ಸೇರಿಸಿ',newsToggle:'ಕಬ್ಬು ಬೇಸಾಯದ ಮಾಹಿತಿ ಮತ್ತು ಅಪ್‌ಡೇಟ್‌ಗಳು ಈ ಇಮೇಲ್‌ಗೆ ಬೇಕು',
 linksT:'ಮುಖ್ಯ ಲಿಂಕ್‌ಗಳು',l1:'ಡೋಸ್ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಕ್ಯಾಲ್ಕುಲೇಟರ್',l2:'Immunity Sugarcane Program',l3:'ರೈತರ ಫಲಿತಾಂಶಗಳು',l4:'WhatsApp ನಲ್ಲಿ ಫೋಟೋ ಕಳುಹಿಸಿ',logout:'ಲಾಗ್ ಔಟ್',loading:'⏳ ಲೋಡ್ ಆಗುತ್ತಿದೆ…',privacy:'ನಿಮ್ಮ ಸಂಖ್ಯೆಯನ್ನು ಲಾಗಿನ್ ಮತ್ತು ನಿಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಲು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.',
 waText:'ganna.in ಲಾಗಿನ್ ಕೋಡ್: '},
en:{login:'Login',acct:'My account',h1:'Log in to ganna.in',lead:'Save your details and get advice without filling forms again.',tabMob:'📱 Mobile (WhatsApp)',tabMail:'✉️ Join with email',
 mobL:'Your WhatsApp mobile number',mobPh:'e.g. 98765 43210',getCode:'Get a login code on WhatsApp',noSms:'We do not send SMS. You send us a code on WhatsApp and we send the OTP on WhatsApp.',
 s1:'Send this code on WhatsApp',waBtn:'Open WhatsApp and send',sendNote:'The message will be ready, just press "Send". Send it to +91 99787 91167 from {n} only.',s2:'Type the 6-digit OTP you get on WhatsApp',
 wait:'⏳ Waiting for your message…',otpSent:'✅ OTP sent on WhatsApp.',otpFail:'Could not send the OTP. Try again or call 99787 91167.',expired:'The code has expired. Get a new one.',
 loginBtn:'Log in',back:'← Change number / new code',errMob:'Enter a valid 10-digit mobile number',errOtp6:'Enter the 6-digit OTP',errWrong:'Wrong OTP.',errOtpExp:'OTP expired. Get a new code.',
 errNoOtp:'No OTP sent yet. First send the code on WhatsApp.',errNet:'Network error. Try again.',tooMany:'Too many tries. Try again in an hour.',
 nameL:'Your name',emailL:'Email',villageL:'Village',districtL:'Taluka / district (optional)',newsT:'🌾 Email updates for sugarcane farming',
 newsP:'We will send educational information, knowledge, season-wise care and updates for better sugarcane farming to this email from time to time.',
 consent:'I agree that Gujarat Bio Organics (ganna.in) may send me educational information, knowledge and updates for better sugarcane farming at this email from time to time. I can stop them any time.',
 join:'Join',joinNote:'To log in on another phone, use mobile (WhatsApp).',okT:'✅ You have joined',okMsg:'Sugarcane farming information will come to your email.',okExist:'This email is already subscribed; updates will continue. Use mobile (WhatsApp) to log in to the account.',
 errName:'Enter your name',errEmail:'Enter a valid email',errConsent:'Tick the consent box for email updates',errJoin:'Could not join. Try again.',
 hello:'Hello',acctSub:'Your ganna.in account',profT:'My details',save:'Save',saved:'✅ Saved',noMob:'No mobile added',addMob:'Add with WhatsApp',
 addEmailP:'Add an email and get information for better sugarcane farming.',addEmail:'Add email',newsToggle:'Send me sugarcane farming information and updates at this email',
 linksT:'Quick links',l1:'Dose schedule and calculator',l2:'Immunity Sugarcane Program',l3:'Farmer results',l4:'Send a photo on WhatsApp',logout:'Log out',loading:'⏳ Loading…',privacy:'Your number is used only for login and to contact you.',
 waText:'ganna.in login code: '}
};
var T=S[LG]||S.gu;
var $=function(id){return document.getElementById(id)};
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function getAuth(){try{return JSON.parse(localStorage.getItem('gn_auth'))}catch(x){return null}}
function setAuth(a){try{if(a)localStorage.setItem('gn_auth',JSON.stringify(a));else localStorage.removeItem('gn_auth')}catch(x){}}
function track(ev,x){window.dataLayer=window.dataLayer||[];var o={event:ev,site:'ganna.in',lang:LG};for(var k in(x||{}))o[k]=x[k];window.dataLayer.push(o);if(window.gtag)gtag('event',ev,x||{})}
function api(b){var a=getAuth();if(a&&a.token&&!b.token)b.token=a.token;b.site='ganna';b.lang=LG;
  return fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b)}).then(function(r){return r.json()})}
function show(id,on){var e=$(id);if(e)e.hidden=!on}
function err(id,m){var e=$(id);if(!e)return;e.textContent=m||'';e.hidden=!m}
var lq=LG==='gu'?'':'?lang='+LG;
var A=getAuth();

/* header link on every page */
var nav=document.querySelector('header .nav');
if(nav){var a=document.createElement('a');a.className='lnk acct'+(A&&A.token?' in':'');a.href=(A&&A.token?'/account/':'/login/')+lq;a.textContent=A&&A.token?T.acct:T.login;
  var call=nav.querySelector('.tcall');nav.insertBefore(a,call||null);}
var sub=document.querySelector('header .subnav');
if(sub){var b=document.createElement('a');b.href=(A&&A.token?'/account/':'/login/')+lq;b.textContent=(A&&A.token?'👤 '+T.acct:'👤 '+T.login);sub.appendChild(b);}

/* pre-fill the lead form for logged-in farmers */
if(A&&A.user){var u=A.user;[['lf-name',u.name],['lf-phone',u.mobile],['lf-village',u.village]].forEach(function(p){var e=$(p[0]);if(e&&!e.value&&p[1])e.value=p[1]})}

/* shell pages: fill text by language */
if(IS_SHELL){document.querySelectorAll('[data-t]').forEach(function(e){var k=e.getAttribute('data-t');if(T[k]!=null)e.textContent=T[k]});
  document.querySelectorAll('[data-ph]').forEach(function(e){e.placeholder=T[e.getAttribute('data-ph')]||''});}

if(IS_SHELL){document.querySelectorAll('.langbar a').forEach(function(x){var l=x.getAttribute('lang');x.href=location.pathname+(l==='gu'?'?lang=gu':'?lang='+l);if(l===LG)x.setAttribute('aria-current','true');else x.removeAttribute('aria-current')});
  try{localStorage.setItem('gn_lang',LG)}catch(x){}}

/* tabs */
document.addEventListener('click',function(e){var t=e.target.closest('[data-tab]');if(!t)return;
  document.querySelectorAll('[data-tab]').forEach(function(x){var on=x===t;x.classList.toggle('on',on);x.setAttribute('aria-selected',on)});
  show('p-mob',t.dataset.tab==='mob');show('p-mail',t.dataset.tab==='mail')});
if($('p-mail')&&location.hash==='#email'){var tb=document.querySelector('[data-tab="mail"]');if(tb)tb.click()}
function nextUrl(){var n=new URLSearchParams(location.search).get('next');return (n&&/^\/[a-z0-9\/?=&#-]*$/i.test(n)?n:'/account/'+lq)}

/* mobile login */
var RQ=null,poll=null;
if($('m1'))$('m1').addEventListener('submit',function(e){e.preventDefault();
  var m=$('m-mobile').value.replace(/\D/g,'').slice(-10);
  if(!/^[6-9]\d{9}$/.test(m)){err('m-err',T.errMob);return}err('m-err','');
  var bt=this.querySelector('button');bt.disabled=true;
  api({action:'start',mobile:m}).then(function(j){bt.disabled=false;
    if(!j.ok){err('m-err',j.error==='too_many'?T.tooMany:T.errNet);return}
    RQ=j.request_id;$('m-code').textContent=j.code;$('m-note').textContent=T.sendNote.replace('{n}',m);
    $('m-wa').href='https://wa.me/'+j.wa+'?text='+encodeURIComponent(T.waText+j.code);
    show('m1',false);show('m2',true);$('m-wait').textContent=T.wait;track('login_code_requested');
    clearInterval(poll);var n=0;
    poll=setInterval(function(){if(++n>300){clearInterval(poll);return}
      api({action:'status',request_id:RQ}).then(function(s){
        if(s.status==='otp_sent'){$('m-wait').textContent=T.otpSent;$('m-wait').classList.add('ok');clearInterval(poll);$('m-otp').focus()}
        if(s.status==='failed'){$('m-wait').textContent=T.otpFail;clearInterval(poll)}
        if(s.status==='expired'){$('m-wait').textContent=T.expired;clearInterval(poll)}
      }).catch(function(){})},3000);
  }).catch(function(){bt.disabled=false;err('m-err',T.errNet)})});
if($('m-back'))$('m-back').addEventListener('click',function(){clearInterval(poll);show('m2',false);show('m1',true)});
if($('m3'))$('m3').addEventListener('submit',function(e){e.preventDefault();
  var o=$('m-otp').value.replace(/\D/g,'');if(o.length!==6){err('m-err2',T.errOtp6);return}
  var bt=this.querySelector('button');bt.disabled=true;
  api({action:'verify',request_id:RQ,otp:o}).then(function(j){bt.disabled=false;
    if(!j.ok){err('m-err2',j.error==='wrong'?T.errWrong:j.error==='expired'?T.errOtpExp:j.error==='no_otp'?T.errNoOtp:T.errNet);return}
    setAuth({token:j.token,user:j.user});track('login_success',{method:'whatsapp_otp'});location.href=nextUrl()})
  .catch(function(){bt.disabled=false;err('m-err2',T.errNet)})});

/* email signup */
if($('e1'))$('e1').addEventListener('submit',function(e){e.preventDefault();var f=new FormData(this);
  var email=String(f.get('email')||'').trim(),name=String(f.get('name')||'').trim();
  if(name.length<2){err('e-err',T.errName);return}
  if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)){err('e-err',T.errEmail);return}
  if(!$('e-consent').checked){err('e-err',T.errConsent);return}
  if(f.get('website'))return;err('e-err','');var bt=this.querySelector('button');bt.disabled=true;
  api({action:'email_signup',name:name,email:email,village:String(f.get('village')||''),district:String(f.get('district')||''),consent:true,consent_text:T.consent})
  .then(function(j){bt.disabled=false;if(!j.ok){err('e-err',j.error==='email'?T.errEmail:T.errJoin);return}
    if(j.token)setAuth({token:j.token,user:j.user});else $('e-okmsg').textContent=T.okExist;
    track('email_signup');show('e1',false);show('e-ok',true)})
  .catch(function(){bt.disabled=false;err('e-err',T.errNet)})});

/* account */
function renderNews(u){var nb=$('a-newsbody');if(!nb)return;
  if(u.email){nb.innerHTML='<p>'+esc(u.email)+'</p><label class="chk"><input type="checkbox" id="a-nl" '+((u.lists||[]).indexOf('sugarcane')>=0?'checked':'')+'><span>'+esc(T.newsToggle)+'</span></label>'}
  else nb.innerHTML='<p>'+esc(T.addEmailP)+'</p><form id="a-mail" class="authf"><label>'+esc(T.emailL)+'<input name="email" type="email" autocomplete="email"></label><label class="chk"><input type="checkbox" name="consent"><span>'+esc(T.consent)+'</span></label><p class="err" id="a-merr" hidden></p><button class="btn btn-primary" type="submit">'+esc(T.addEmail)+'</button></form>'}
if($('acctbox')){
  if(!A||!A.token){location.replace('/login/?next=/account/'+(lq?encodeURIComponent(lq):'')+(lq?'&lang='+LG:''))}
  else api({action:'me'}).then(function(j){
    if(!j.ok){setAuth(null);location.replace('/login/'+lq);return}
    var u=j.user;setAuth({token:A.token,user:u});show('a-load',false);show('a-main',true);
    $('a-hi').textContent=(u.name?u.name+', ':'')+T.hello+' 🙏';
    var f=$('a-prof');f.name.value=u.name||'';f.village.value=u.village||'';f.district.value=u.district||'';
    $('a-ids').innerHTML=(u.mobile?'📱 '+esc(u.mobile)+(u.mobile_verified?' ✅':''):'📱 '+esc(T.noMob)+': <a href="/login/'+lq+'">'+esc(T.addMob)+'</a>')+(u.email?' &nbsp; ✉️ '+esc(u.email):'');
    renderNews(u)});
}
document.addEventListener('submit',function(e){
  if(e.target.id==='a-prof'){e.preventDefault();var f=e.target;api({action:'update',name:f.name.value,village:f.village.value,district:f.district.value}).then(function(j){if(j.ok){show('a-saved',true);setAuth({token:getAuth().token,user:j.user})}})}
  if(e.target.id==='a-mail'){e.preventDefault();var f=e.target,em=f.email.value.trim();
    if(!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(em)){err('a-merr',T.errEmail);return}
    if(!f.consent.checked){err('a-merr',T.errConsent);return}
    var a=getAuth();api({action:'email_signup',email:em,name:(a.user&&a.user.name)||'Farmer',consent:true,consent_text:T.consent}).then(function(j){if(j.ok&&j.user){setAuth({token:a.token,user:j.user});renderNews(j.user);track('email_signup',{where:'account'})}else err('a-merr',T.errJoin)})}
});
document.addEventListener('change',function(e){if(e.target.id==='a-nl')api({action:'update',subscribed:e.target.checked,consent_text:T.consent})});
if($('a-out'))$('a-out').addEventListener('click',function(){api({action:'logout'}).finally(function(){setAuth(null);location.href=LG==='gu'?'/':'/'+LG+'/'})});
if(IS_SHELL){document.querySelectorAll('[data-href]').forEach(function(e){var h=e.getAttribute('data-href');e.href=(LG==='gu'||/^https?:/.test(h))?h:'/'+LG+h})}
})();
