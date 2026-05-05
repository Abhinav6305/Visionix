"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Upload,
  Mic,
  Image as ImageIcon,
} from "lucide-react"

import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export default function LandingPage() {
  const { language } = useLanguage()
  const copy = {
    en: {
      product: "Product",
      experience: "Experience",
      demo: "Demo",
      login: "Login",
      badge: "Built for small business owners who need answers, not dashboards",
      heroLine1: "Upload data.",
      heroLine2: "Get decisions, reasoning, and actions.",
      heroBody:
        "Visionix is an AI Business Advisor that turns sales data, voice notes, and printed records into clear, actionable decisions you can trust.",
      ctaPrimary: "Start Decision Feed",
      ctaSecondary: "View Product Demo",
      trustItems: [
        "Explainable recommendations",
        "Daily priorities for owners",
        "Decision-first AI workflow",
      ],
      recommendationsTitle: "Today's recommendations",
      recommendationsSub: "3 actions worth doing now",
      aiConfidence: "AI Confidence High",
      whyTitle: "Why it stands out",
      whyHeading: "Not another BI tool. A trusted operator in your pocket.",
      whyBody:
        "Power BI and Tableau show you what happened. Visionix goes one step further and tells you what it means, how confident it is, and what to do next.",
      whyItems: [
        "Decision feed instead of dashboard clutter",
        "Explain WHY engine for every recommendation",
        "Owner-friendly language with no analytics jargon",
        "Daily actions, alerts, and WhatsApp-style summaries",
      ],
      demoFlow: "Demo flow",
      demoHeading: "Upload. Think. Decide. Act.",
      demoSteps: [
        "Upload a CSV, speak an order, or snap a photo of a record",
        "Watch Visionix parse and analyze demand, risks, and momentum",
        "Open any decision card to see the reasoning and suggested action",
        "Ask the AI advisor for a simpler explanation or follow-up steps",
      ],
      whatsapp: "WhatsApp preview",
      whatsappText:
        "VISIONIX: Shirts are slowing down. Reduce price by 5% and move best-selling sizes to the front rack today.",
      trustSignals: "Trust signals",
      trustSignalItems: [
        "Confidence scores on every decision",
        "Charts hidden until you ask for evidence",
        "Fast summaries for busy owners",
        "Action steps that feel operational",
      ],
      teamLabel: "Core team",
      teamHeading: "The builders behind VISIONIX",
      teamBody:
        "A startup-grade product needs more than code. It needs a team that can think product, engineering, and delivery together.",
      contributorsLabel: "Contributors",
      contributorsHeading: "The people supporting VISIONIX",
      contributorsBody:
        "Beyond the core team, contributors helped strengthen the project through support, review, and collaboration.",
    },
    hi: {
      product: "उत्पाद",
      experience: "अनुभव",
      demo: "डेमो",
      login: "लॉगिन",
      badge: "उन छोटे व्यवसाय मालिकों के लिए बनाया गया है जिन्हें डैशबोर्ड नहीं, जवाब चाहिए",
      heroLine1: "डेटा अपलोड करें।",
      heroLine2: "निर्णय, कारण और कार्य प्राप्त करें।",
      heroBody:
        "Visionix उन मालिकों के लिए एआई बिज़नेस एडवाइज़र है जो स्प्रेडशीट्स से परेशान हैं। यह कच्चे बिक्री डेटा को स्पष्ट अगले कदमों में बदल देता है।",
      ctaPrimary: "निर्णय फ़ीड शुरू करें",
      ctaSecondary: "प्रोडक्ट डेमो देखें",
      trustItems: [
        "समझाने योग्य सिफारिशें",
        "मालिकों के लिए दैनिक प्राथमिकताएँ",
        "निर्णय-प्रथम एआई वर्कफ़्लो",
      ],
      recommendationsTitle: "आज की सिफारिशें",
      recommendationsSub: "अभी करने योग्य 3 कार्रवाइयाँ",
      aiConfidence: "एआई भरोसा उच्च",
      whyTitle: "यह क्यों अलग है",
      whyHeading: "यह कोई और BI टूल नहीं है। यह आपकी जेब में एक भरोसेमंद ऑपरेटर है।",
      whyBody:
        "Power BI और Tableau आपको बताते हैं कि क्या हुआ। Visionix एक कदम आगे बढ़कर बताता है कि इसका क्या मतलब है, कितना भरोसा है, और आगे क्या करना है।",
      whyItems: [
        "डैशबोर्ड की भीड़ के बजाय निर्णय फ़ीड",
        "हर सिफारिश के लिए Explain WHY इंजन",
        "एनालिटिक्स जार्गन के बिना मालिक-हितैषी भाषा",
        "दैनिक कार्य, अलर्ट और WhatsApp-शैली सारांश",
      ],
      demoFlow: "डेमो प्रवाह",
      demoHeading: "अपलोड करें। सोचें। निर्णय लें। कार्य करें।",
      demoSteps: [
        "अपनी CSV बिक्री या इन्वेंटरी फ़ाइल अपलोड करें",
        "देखें कि Visionix मांग, जोखिम और गति का विश्लेषण कैसे करता है",
        "कारण देखने के लिए किसी भी निर्णय कार्ड को खोलें",
        "कार्य करें या सलाहकार से सरल व्याख्या पूछें",
      ],
      whatsapp: "WhatsApp पूर्वावलोकन",
      whatsappText:
        "VISIONIX: शर्ट्स की गति धीमी है। कीमत 5% घटाइए और आज सबसे अधिक बिकने वाले साइज को फ्रंट रैक पर रखिए।",
      trustSignals: "विश्वास संकेत",
      trustSignalItems: [
        "हर निर्णय पर confidence score",
        "जब तक आप साक्ष्य न माँगें, चार्ट छिपे रहते हैं",
        "व्यस्त मालिकों के लिए तेज़ सारांश",
        "कार्यवाही योग्य कदम",
      ],
      teamLabel: "मुख्य टीम",
      teamHeading: "VISIONIX के पीछे की टीम",
      teamBody:
        "स्टार्टअप-स्तरीय प्रोडक्ट को केवल कोड नहीं, बल्कि प्रोडक्ट, इंजीनियरिंग और डिलीवरी को साथ सोचने वाली टीम चाहिए।",
      contributorsLabel: "योगदानकर्ता",
      contributorsHeading: "VISIONIX को मजबूत बनाने वाले लोग",
      contributorsBody:
        "कोर टीम के अलावा, योगदानकर्ताओं ने सहयोग, समीक्षा और समर्थन के जरिए इस प्रोजेक्ट को और मजबूत बनाया।",
    },
    te: {
      product: "ఉత్పత్తి",
      experience: "అనుభవం",
      demo: "డెమో",
      login: "లాగిన్",
      badge: "డ్యాష్‌బోర్డ్లు కాదు, సమాధానాలు కావాల్సిన చిన్న వ్యాపార యజమానుల కోసం నిర్మించబడింది",
      heroLine1: "డేటాను అప్లోడ్ చేయండి.",
      heroLine2: "నిర్ణయాలు, కారణాలు, చర్యలు పొందండి.",
      heroBody:
        "Visionix స్ప్రెడ్‌షీట్‌లతో ఇబ్బందిపడే యజమానుల కోసం రూపొందించిన ఏఐ బిజినెస్ అడ్వైజర్. ఇది ముడి అమ్మకాల డేటాను స్పష్టమైన తదుపరి చర్యలుగా మార్చుతుంది.",
      ctaPrimary: "నిర్ణయ ఫీడ్ ప్రారంభించండి",
      ctaSecondary: "ప్రోడక్ట్ డెమో చూడండి",
      trustItems: [
        "వివరణాత్మక సిఫారసులు",
        "యజమానుల కోసం రోజువారీ ప్రాధాన్యాలు",
        "నిర్ణయ-మొదటి ఏఐ వర్క్‌ఫ్లో",
      ],
      recommendationsTitle: "ఈరోజు సిఫారసులు",
      recommendationsSub: "ఇప్పుడే చేయదగిన 3 చర్యలు",
      aiConfidence: "ఏఐ నమ్మకం అధికం",
      whyTitle: "ఇది ఎందుకు ప్రత్యేకం",
      whyHeading: "ఇది ఇంకో BI టూల్ కాదు. ఇది మీ జేబులోని విశ్వసనీయ ఆపరేటర్.",
      whyBody:
        "Power BI మరియు Tableau ఏమి జరిగిందో చూపుతాయి. Visionix ఒక అడుగు ముందుకేసి దాని అర్థం ఏమిటి, దానిపై ఎంత నమ్మకం ఉంది, తర్వాత మీరు ఏమి చేయాలి అని చెబుతుంది.",
      whyItems: [
        "డ్యాష్‌బోర్డ్ గందరగోళం కాకుండా నిర్ణయ ఫీడ్",
        "ప్రతి సిఫారసుకు Explain WHY ఇంజిన్",
        "అనలిటిక్స్ జార్గన్ లేకుండా యజమానులకు అర్థమయ్యే భాష",
        "రోజువారీ చర్యలు, అలర్ట్లు, WhatsApp శైలి సారాంశాలు",
      ],
      demoFlow: "డెమో ప్రవాహం",
      demoHeading: "అప్లోడ్ చేయండి. ఆలోచించండి. నిర్ణయించండి. చర్య తీసుకోండి.",
      demoSteps: [
        "మీ CSV అమ్మకాలు లేదా ఇన్వెంటరీ ఫైల్‌ను అప్లోడ్ చేయండి",
        "Visionix డిమాండ్, ప్రమాదాలు, వేగాన్ని ఎలా విశ్లేషిస్తుందో చూడండి",
        "కారణం తెలుసుకోవడానికి ఏదైనా నిర్ణయ కార్డ్‌ను తెరవండి",
        "చర్య తీసుకోండి లేదా సలహాదారుని సరళమైన వివరణ అడగండి",
      ],
      whatsapp: "WhatsApp ప్రివ్యూ",
      whatsappText:
        "VISIONIX: షర్ట్ల అమ్మకాలు నెమ్మదిస్తున్నాయి. ధరను 5% తగ్గించి, ఈరోజే ఎక్కువగా అమ్ముడయ్యే సైజులను ముందు ర్యాక్‌లో పెట్టండి.",
      trustSignals: "నమ్మక సంకేతాలు",
      trustSignalItems: [
        "ప్రతి నిర్ణయంపై నమ్మకం స్థాయి",
        "మీరు ఆధారాలు అడిగే వరకు చార్టులు దాచబడి ఉంటాయి",
        "బిజీ యజమానుల కోసం వేగవంతమైన సారాంశాలు",
        "ఆపరేషనల్‌గా ఉపయోగపడే చర్యలు",
      ],
      teamLabel: "కోర్ టీమ్",
      teamHeading: "VISIONIX వెనుక ఉన్న నిర్మాణ బృందం",
      teamBody:
        "స్టార్టప్ స్థాయి ఉత్పత్తికి కేవలం కోడ్ సరిపోదు. ప్రోడక్ట్, ఇంజనీరింగ్, డెలివరీని కలిసి ఆలోచించే బృందం అవసరం.",
    },
  }[language]
  const heroDecisions = {
    en: [
      { kind: "problem", label: "Sales dipped in shirts", reason: "Demand softened while inventory stayed high.", action: "Reduce price by 5% and shift front-display space.", confidence: 91 },
      { kind: "opportunity", label: "Kurtis are outperforming", reason: "Revenue share is rising faster than the rest of the catalog.", action: "Restock winning sizes before the weekend rush.", confidence: 86 },
      { kind: "warning", label: "One segment is tying up cash", reason: "Slow-moving stock is growing faster than sales.", action: "Pause reorders and bundle with fast sellers.", confidence: 79 },
    ],
    hi: [
      { kind: "problem", label: "शर्ट्स की बिक्री घटी", reason: "मांग कम हुई जबकि इन्वेंटरी ऊँची रही।", action: "कीमत 5% घटाएँ और फ्रंट-डिस्प्ले स्पेस बदलें।", confidence: 91 },
      { kind: "opportunity", label: "कुर्तियाँ बेहतर प्रदर्शन कर रही हैं", reason: "राजस्व हिस्सेदारी बाकी कैटलॉग से तेज़ बढ़ रही है।", action: "वीकेंड रश से पहले जीतने वाले साइज रीस्टॉक करें।", confidence: 86 },
      { kind: "warning", label: "एक सेगमेंट नकदी रोक रहा है", reason: "धीमी गति से बिकने वाला स्टॉक बिक्री से तेज़ बढ़ रहा है।", action: "रीऑर्डर रोकें और तेज़ बिकने वाले उत्पादों के साथ बंडल करें।", confidence: 79 },
    ],
    te: [
      { kind: "problem", label: "షర్ట్ల అమ్మకాలు తగ్గాయి", reason: "డిమాండ్ తగ్గినా నిల్వలు ఎక్కువగానే ఉన్నాయి.", action: "ధరను 5% తగ్గించి ఫ్రంట్-డిస్ప్లే స్థలాన్ని మార్చండి.", confidence: 91 },
      { kind: "opportunity", label: "కుర్తీలు మంచి పనితీరు చూపుతున్నాయి", reason: "రెవెన్యూ వాటా మిగతా క్యాటలాగ్ కంటే వేగంగా పెరుగుతోంది.", action: "వీకెండ్ రష్‌కు ముందు మంచి సైజులను రీస్టాక్ చేయండి.", confidence: 86 },
      { kind: "warning", label: "ఒక విభాగం నగదును నిలిపివేస్తోంది", reason: "నెమ్మదిగా అమ్ముడవుతున్న స్టాక్ అమ్మకాల కంటే వేగంగా పెరుగుతోంది.", action: "రీఆర్డర్లు ఆపి వేగంగా అమ్ముడయ్యే వాటితో కలిపి అమ్మండి.", confidence: 79 },
    ],
  }[language]
  const productSteps = {
    en: [
      { icon: Mic, title: "Voice & Image Data Creation", copy: "Just speak your orders or take a photo of handwritten records. Visionix converts them into structured data instantly." },
      { icon: BrainCircuit, title: "AI Decision Engine", copy: "Visionix analyzes your business momentum to find the real problem, the reason, and the exact action to take." },
      { icon: MessageSquareText, title: "Act with Confidence", copy: "Get simple actions with confidence scores, plus a chat advisor that knows your business history." },
    ],
    hi: [
      { icon: Upload, title: "अपना व्यवसायिक डेटा अपलोड करें", copy: "यदि आप स्प्रेडशीट नहीं जानते, तब भी CSV फ़ाइलें कुछ ही सेकंड में व्यवसायिक संदर्भ बन जाती हैं।" },
      { icon: BrainCircuit, title: "एआई असली समस्या ढूँढता है", copy: "Visionix पता लगाता है कि क्या गलत है, क्यों हुआ, और यह कितना तात्कालिक है।" },
      { icon: MessageSquareText, title: "आत्मविश्वास के साथ कार्य करें", copy: "सरल कार्य, व्याख्या और बिज़नेस कोच की तरह बोलने वाला चैट सलाहकार प्राप्त करें।" },
    ],
    te: [
      { icon: Upload, title: "మీ వ్యాపార డేటాను అప్లోడ్ చేయండి", copy: "మీకు స్ప్రెడ్‌షీట్లు తెలియకపోయినా CSV ఫైళ్లు కొన్ని సెకండ్లలో వ్యాపార సందర్భంగా మారుతాయి." },
      { icon: BrainCircuit, title: "ఏఐ అసలు సమస్యను కనుగొంటుంది", copy: "Visionix ఏం తప్పు, ఎందుకు జరిగింది, అది ఎంత అత్యవసరం అనే విషయాలను గుర్తిస్తుంది." },
      { icon: MessageSquareText, title: "నమ్మకంతో చర్య తీసుకోండి", copy: "సరళమైన చర్యలు, వివరణలు, వ్యాపార కోచ్‌లా మాట్లాడే చాట్ సలహాదారును పొందండి." },
    ],
  }[language]
  const coreTeam = [
    {
      name: "S ABHINAV RISHI",
      role:
        language === "te"
          ? "Founder & Main Developer"
          : language === "hi"
            ? "Founder & Main Developer"
            : "Founder & Main Developer",
      image: "/team-abhinav.jpeg",
      imageClassName: "object-[center_16%]",
    },
    {
      name: "VS SAI SIDDARTHA",
      role:
        language === "te"
          ? "Co-founder Backend Developer"
          : language === "hi"
            ? "Co-founder Backend Developer"
            : "Co-founder Backend Developer",
      image: "/team-vs-sai-siddartha.png",
      imageClassName: "object-[center_28%]",
    },
    {
      name: "SHLOK KARN",
      role:
        language === "te"
          ? "Co-founder, Frontend Developer"
          : language === "hi"
            ? ",Co-founder, Frontend Developer"
            : "Co-founder,Frontend Developer",
      image: "/team-shlok.jpeg",
      imageClassName: "object-[center_20%]",
    },
  ]
  const contributors = [
    {
      name: "B.V.H.V.S SUHAS",
      subtitle: "Manipal University-Bangalore",
      image: "/contributor-suhas.png",
      imageClassName: "object-[center_32%]",
    },
    {
      name: "D NIRUPA",
      image: "/contributor-omkar.jpg",
      subtitle: "Contributor",
      imageClassName: "object-[center_18%]",
    },
    {
      name: "T. Sreeshith",
      subtitle: "DRDO Intern Bangalore",
      image: "/placeholder-user.jpg",
      imageClassName: "object-cover",
    },
    {
      name: "M SHIVANI",
      image: "/contributor-nirupa.jpg",
      subtitle: "Contributor",
      imageClassName: "object-[center_24%]",
    },
  ]
  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(247,251,255,1)_0%,rgba(230,241,255,1)_55%,rgba(211,230,255,1)_100%)] text-foreground dark:bg-[radial-gradient(circle_at_top,_rgba(18,96,255,0.22),_transparent_32%),linear-gradient(180deg,_#07111f_0%,_#060b14_45%,_#04070d_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,113,219,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(56,113,219,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-60 dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] dark:opacity-25" />

      <nav className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="relative h-11 w-11 overflow-hidden rounded-2xl ring-1 ring-blue-200 dark:ring-white/10">
            <Image src="/visionix-logo.png" alt="Visionix" fill className="object-cover" priority />
          </div>
          <div>
            <p className="text-lg font-semibold tracking-[0.18em] text-slate-950 dark:text-white">VISIONIX</p>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Decision Intelligence</p>
          </div>
        </div>

        <div className="hidden items-center gap-8 text-sm text-slate-700 md:flex dark:text-slate-300">
          <a href="#product" className="transition hover:text-slate-950 dark:hover:text-white">{copy.product}</a>
          <a href="#experience" className="transition hover:text-slate-950 dark:hover:text-white">{copy.experience}</a>
          <a href="#demo" className="transition hover:text-slate-950 dark:hover:text-white">{copy.demo}</a>
          <Link href="/auth/login" className="transition hover:text-slate-950 dark:hover:text-white">{copy.login}</Link>
          <LanguageSwitcher compact />
          <ThemeToggle />
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-20 lg:px-10">
        <section className="grid items-center gap-14 pb-20 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:pt-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/40 bg-blue-500/10 px-4 py-2 text-sm text-blue-700 dark:border-cyan-400/25 dark:bg-cyan-400/10 dark:text-cyan-100"
            >
              <Sparkles className="h-4 w-4" />
              {copy.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="max-w-4xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950 dark:text-white md:text-6xl xl:text-7xl"
            >
              {copy.heroLine1}
              <span className="block bg-[linear-gradient(120deg,#0f172a_0%,#2563eb_42%,#3b82f6_100%)] bg-clip-text text-transparent dark:bg-[linear-gradient(120deg,#ffffff_0%,#8ed6ff_42%,#4f93ff_100%)]">
                {copy.heroLine2}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-slate-800 dark:text-slate-300"
            >
              {copy.heroBody}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <Link href="/auth/signup">
                <Button size="lg" className="h-13 rounded-2xl bg-[linear-gradient(135deg,#56c7ff_0%,#2253ff_100%)] px-7 text-base text-white shadow-[0_18px_60px_rgba(34,83,255,0.35)]">
                  {copy.ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button size="lg" variant="outline" className="h-13 rounded-2xl border-blue-200 bg-white/80 px-7 text-base text-slate-900 backdrop-blur-xl dark:border-white/15 dark:bg-white/5 dark:text-white">
                  {copy.ctaSecondary}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="mt-10 flex flex-wrap gap-6 text-sm text-slate-700 dark:text-slate-300"
            >
              {copy.trustItems.map((item, index) => (
                <div key={item} className="flex items-center gap-2">
                  {index === 0 ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  ) : index === 1 ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <BrainCircuit className="h-4 w-4 text-emerald-400" />
                  )}
                  {item}
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative"
          >
            <div className="absolute -left-10 top-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />
            <div className="absolute -right-12 bottom-8 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
            <Card className="glass-card motion-surface relative overflow-hidden rounded-[30px] border border-blue-200/50 bg-white/70 shadow-[0_30px_80px_rgba(63,98,170,0.18)] dark:border-white/10 dark:bg-white/8 dark:shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-600 dark:text-slate-400">{copy.recommendationsTitle}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{copy.recommendationsSub}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {copy.aiConfidence}
                  </div>
                </div>

                <div className="space-y-4">
                  {heroDecisions.map((decision, index) => (
                    <motion.div
                      key={decision.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.45 + index * 0.12 }}
                      whileHover={{ y: -12, scale: 1.018, rotateX: 1.5 }}
                      className="motion-surface rounded-3xl border border-blue-100 bg-white/65 p-5 backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/45"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] ${
                            decision.kind === "problem"
                              ? "bg-rose-500/15 text-rose-200"
                              : decision.kind === "opportunity"
                                ? "bg-emerald-500/15 text-emerald-200"
                                : "bg-amber-500/15 text-amber-100"
                          }`}
                        >
                          {decision.kind}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{decision.confidence}% confidence</span>
                      </div>
                      <p className="text-lg font-semibold text-slate-950 dark:text-white">{decision.label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-800 dark:text-slate-300">{decision.reason}</p>
                      <p className="mt-3 rounded-2xl bg-blue-600/10 px-4 py-3 text-sm font-medium text-blue-900 dark:bg-white/5 dark:text-cyan-100">{decision.action}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section id="product" className="grid gap-6 py-16 lg:grid-cols-3">
          {productSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <Card className="glass-card motion-surface h-full rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
                  <CardContent className="p-7">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="text-2xl font-semibold text-slate-950 dark:text-white">{step.title}</h3>
                    <p className="mt-3 text-base leading-7 text-slate-800 dark:text-slate-300">{step.copy}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </section>

        <section id="experience" className="grid gap-8 py-16 lg:grid-cols-[0.88fr_1.12fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-blue-700 dark:text-cyan-200">{copy.whyTitle}</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-950 dark:text-white">{copy.whyHeading}</h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-700 dark:text-slate-300">
              {copy.whyBody}
            </p>
          </div>

          <Card className="glass-card motion-surface rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
            <CardContent className="grid gap-4 p-6 md:grid-cols-2">
              {copy.whyItems.map((item) => (
                <div key={item} className="motion-surface rounded-3xl border border-blue-100 bg-white/70 p-5 text-slate-800 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-200">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="py-14">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-blue-700 dark:text-cyan-200">{copy.teamLabel}</p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-950 dark:text-white">{copy.teamHeading}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-300">{copy.teamBody}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {coreTeam.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
              >
                <Card className="glass-card motion-surface overflow-hidden rounded-[24px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
                  <div className="relative h-[320px] w-full overflow-hidden bg-slate-950">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className={`object-cover grayscale contrast-110 brightness-95 transition duration-700 hover:scale-[1.03] ${member.imageClassName}`}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.26)_100%)] mix-blend-multiply" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <CardContent className="p-5">
                    <p className="text-[1.75rem] font-semibold leading-tight text-slate-950 dark:text-white">{member.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-blue-700 dark:text-cyan-200">
                      {member.role}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="py-10">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-blue-700 dark:text-cyan-200">
              {language === "te" ? "కాంట్రిబ్యూటర్స్" : language === "hi" ? "योगदानकर्ता" : "Contributors"}
            </p>
            <h2 className="mt-4 text-4xl font-semibold text-slate-950 dark:text-white">
              {language === "te"
                ? "VISIONIX ను బలపరిచిన వారు"
                : language === "hi"
                  ? "VISIONIX को मजबूत बनाने वाले लोग"
                  : "The people supporting VISIONIX"}
            </h2>
            <p className="mt-4 text-lg leading-8 text-slate-700 dark:text-slate-300">
              {language === "te"
                ? "కోర్ టీమ్ కు తోడు, సహకారం మరియు మద్దతు ద్వారా ఈ ప్రాజెక్ట్ ను బలపరిచిన కాంట్రిబ్యూటర్స్ కూడా ఉన్నారు."
                : language === "hi"
                  ? "कोर टीम के अलावा, सहयोग और समर्थन के जरिए इस प्रोजेक्ट को मजबूत बनाने वाले योगदानकर्ता भी हैं।"
                  : "Beyond the core team, contributors helped strengthen the project through support and collaboration."}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {contributors.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
              >
                <Card className="glass-card motion-surface overflow-hidden rounded-[24px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
                  <div className="relative h-[280px] w-full overflow-hidden bg-slate-950">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                      className={`object-cover grayscale contrast-125 brightness-90 transition duration-[900ms] hover:scale-[1.06] ${member.imageClassName}`}
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.26)_100%)] mix-blend-multiply" />
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <CardContent className="p-5">
                    <p className="text-[1.45rem] font-semibold leading-tight text-slate-950 dark:text-white">{member.name}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.24em] text-blue-700 dark:text-cyan-200">
                      {member.subtitle || (language === "te" ? "Contributor" : language === "hi" ? "Contributor" : "Contributor")}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section id="demo" className="pb-12 pt-16">
          <Card className="glass-card motion-surface overflow-hidden rounded-[32px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
            <CardContent className="grid gap-10 p-7 lg:grid-cols-[0.85fr_1.15fr] lg:p-10">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-blue-700 dark:text-cyan-200">{copy.demoFlow}</p>
                <h2 className="mt-4 text-4xl font-semibold text-slate-950 dark:text-white">{copy.demoHeading}</h2>
                <div className="mt-8 space-y-4">
                  {copy.demoSteps.map((step, index) => (
                    <div key={step} className="motion-surface flex items-start gap-4 rounded-3xl border border-blue-100 bg-white/70 p-4 text-slate-900 dark:border-white/10 dark:bg-slate-950/45 dark:text-slate-200">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-600/15 font-semibold text-blue-900 dark:bg-white/8 dark:text-white">
                        {index + 1}
                      </div>
                      <p className="pt-1">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="motion-surface rounded-[28px] border border-blue-100 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-950/50">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">{copy.whatsapp}</p>
                  <div className="mt-4 rounded-[24px] bg-emerald-500/15 p-4 text-sm leading-6 text-emerald-900 dark:bg-emerald-500/10 dark:text-emerald-100">
                    {copy.whatsappText}
                  </div>
                </div>
                <div className="motion-surface rounded-[28px] border border-blue-100 bg-white/70 p-5 dark:border-white/10 dark:bg-slate-950/50">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">{copy.trustSignals}</p>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {copy.trustSignalItems.map((item) => (
                      <div key={item} className="motion-surface rounded-2xl bg-blue-600/10 p-4 text-slate-900 dark:bg-white/5 dark:text-slate-200">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
