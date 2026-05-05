"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import NextLink from "next/link"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  BrainCircuit,
  BellRing,
  FileText,
  ChevronLeft,
  LogOut,
  PencilLine,
  Mail,
  Trash2,
  ShieldCheck,
  Briefcase,
  Building2,
  Database,
  Search,
  Settings,
  ImagePlus,
  Save,
  CheckCircle2,
  Crown,
  Sparkles,
  Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"
import { type LanguageCode, useLanguage } from "@/lib/language-context"

type NavItem = {
  icon: React.ElementType
  label: Record<LanguageCode, string>
  id: string
}

const navItems: NavItem[] = [
  {
    icon: LayoutDashboard,
    label: { en: "Overview", hi: "अवलोकन", te: "అవలోకనం" },
    id: "overview",
  },
  {
    icon: BrainCircuit,
    label: { en: "Decision Feed", hi: "निर्णय फ़ीड", te: "నిర్ణయ ఫీడ్" },
    id: "insights",
  },
  {
    icon: BellRing,
    label: { en: "Advisor Chat", hi: "सलाहकार चैट", te: "సలహాదారు చాట్" },
    id: "chat",
  },
  {
    icon: FileText,
    label: { en: "Reports", hi: "रिपोर्ट्स", te: "రిపోర్ట్స్" },
    id: "reports",
  },
]

const sidebarCopy: Record<
  LanguageCode,
  {
    theme: string
    logout: string
    collapse: string
    language: string
    workspace: string
    free: string
    pro: string
    editProfile: string
    profileTitle: string
    profileDescription: string
    fullName: string
    fullNamePlaceholder: string
    email: string
    companyName: string
    companyPlaceholder: string
    role: string
    rolePlaceholder: string
    dataType: string
    dataPlaceholder: string
    photo: string
    uploadPhoto: string
    photoHint: string
    save: string
    cancel: string
  }
> = {
  en: {
    theme: "Theme",
    logout: "Logout",
    collapse: "Collapse",
    language: "Language",
    workspace: "Workspace",
    free: "Free",
    pro: "Pro",
    editProfile: "Edit profile",
    profileTitle: "Edit your profile",
    profileDescription: "Update your business identity and preferences in one place.",
    fullName: "Full name",
    fullNamePlaceholder: "Your name",
    email: "Email",
    companyName: "Company name",
    companyPlaceholder: "Your business name",
    role: "Your role",
    rolePlaceholder: "Select your role",
    dataType: "Preferred data type",
    dataPlaceholder: "Select data type",
    photo: "Profile photo",
    uploadPhoto: "Upload photo",
    photoHint: "Use JPG, PNG, or WEBP",
    save: "Save changes",
    cancel: "Cancel",
  },
  hi: {
    theme: "थीम",
    logout: "लॉगआउट",
    collapse: "समेटें",
    language: "भाषा",
    workspace: "कार्यस्थान",
    free: "फ्री",
    pro: "प्रो",
    editProfile: "प्रोफ़ाइल संपादित करें",
    profileTitle: "अपनी प्रोफ़ाइल संपादित करें",
    profileDescription: "अपनी व्यावसायिक पहचान और पसंदों को यहीं अपडेट रखें।",
    fullName: "पूरा नाम",
    fullNamePlaceholder: "आपका नाम",
    email: "ईमेल",
    companyName: "कंपनी का नाम",
    companyPlaceholder: "आपके व्यवसाय का नाम",
    role: "आपकी भूमिका",
    rolePlaceholder: "अपनी भूमिका चुनें",
    dataType: "पसंदीदा डेटा प्रकार",
    dataPlaceholder: "डेटा प्रकार चुनें",
    photo: "प्रोफ़ाइल फ़ोटो",
    uploadPhoto: "फ़ोटो अपलोड करें",
    photoHint: "JPG, PNG या WEBP का उपयोग करें",
    save: "परिवर्तन सहेजें",
    cancel: "रद्द करें",
  },
  te: {
    theme: "థీమ్",
    logout: "లాగ్ అవుట్",
    collapse: "మూయండి",
    language: "భాష",
    workspace: "వర్క్‌స్పేస్",
    free: "ఫ్రీ",
    pro: "ప్రో",
    editProfile: "ప్రొఫైల్‌ను సవరించండి",
    profileTitle: "మీ ప్రొఫైల్‌ను సవరించండి",
    profileDescription: "మీ వ్యాపార గుర్తింపు మరియు ప్రాధాన్యాలను ఇక్కడే తాజాగా ఉంచండి.",
    fullName: "పూర్తి పేరు",
    fullNamePlaceholder: "మీ పేరు",
    email: "ఇమెయిల్",
    companyName: "కంపెనీ పేరు",
    companyPlaceholder: "మీ వ్యాపార పేరు",
    role: "మీ పాత్ర",
    rolePlaceholder: "మీ పాత్రను ఎంచుకోండి",
    dataType: "ఇష్టమైన డేటా రకం",
    dataPlaceholder: "డేటా రకం ఎంచుకోండి",
    photo: "ప్రొఫైల్ ఫోటో",
    uploadPhoto: "ఫోటో అప్‌లోడ్ చేయండి",
    photoHint: "JPG, PNG లేదా WEBP ఉపయోగించండి",
    save: "మార్పులను సేవ్ చేయండి",
    cancel: "రద్దు",
  },
}

const smbOptions: Record<LanguageCode, { value: string; label: string }[]> = {
  en: [
    { value: "small", label: "Small Scale Business" },
    { value: "medium", label: "Medium Scale Business" },
  ],
  hi: [
    { value: "small", label: "लघु स्तर का व्यवसाय" },
    { value: "medium", label: "मध्यम स्तर का व्यवसाय" },
  ],
  te: [
    { value: "small", label: "చిన్న స్థాయి వ్యాపారం" },
    { value: "medium", label: "మధ్య తరహా వ్యాపారం" },
  ],
}

const dataTypeOptions: Record<LanguageCode, { value: string; label: string }[]> = {
  en: [
    { value: "sales", label: "Sales & Revenue" },
    { value: "inventory", label: "Inventory & Supply Chain" },
    { value: "finance", label: "Finance & Accounting" },
    { value: "marketing", label: "Marketing & Analytics" },
    { value: "other", label: "Other" },
  ],
  hi: [
    { value: "sales", label: "बिक्री और राजस्व" },
    { value: "inventory", label: "इन्वेंटरी और सप्लाई चेन" },
    { value: "finance", label: "वित्त और लेखांकन" },
    { value: "marketing", label: "मार्केटिंग और एनालिटिक्स" },
    { value: "other", label: "अन्य" },
  ],
  te: [
    { value: "sales", label: "అమ్మకాలు మరియు ఆదాయం" },
    { value: "inventory", label: "ఇన్వెంటరీ మరియు సరఫరా గొలుసు" },
    { value: "finance", label: "ఫైనాన్స్ మరియు అకౌంటింగ్" },
    { value: "marketing", label: "మార్కెటింగ్ మరియు అనలిటిక్స్" },
    { value: "other", label: "ఇతర" },
  ],
}

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showLogoModal, setShowLogoModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showPlansModal, setShowPlansModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [name, setName] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [smbType, setSmbType] = useState<"small" | "medium" | "">("")
  const [businessType, setBusinessType] = useState("")
  const [avatar, setAvatar] = useState("")
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const { user, logout, updateUser, deleteCurrentUser } = useAuth()
  const { language } = useLanguage()

  const copy = sidebarCopy[language]
  const userInitial = useMemo(() => user?.name?.trim()?.charAt(0)?.toUpperCase() || "V", [user?.name])
  const planLabel = user?.plan === "pro" ? copy.pro : copy.free
  const planClassName =
    user?.plan === "pro"
      ? "border-amber-300/30 bg-amber-400/15 text-amber-100 dark:border-amber-300/25 dark:bg-amber-400/12 dark:text-amber-100"
      : "border-blue-200/60 bg-white/85 text-blue-800 dark:border-white/10 dark:bg-white/8 dark:text-cyan-100"
  const planUi = {
    en: {
      open: user?.plan === "pro" ? "Manage plan" : "View plans",
      title: "Plans and upgrades",
      description: "Compare Free and Pro, then upgrade when you need full AI decision intelligence.",
      current: "Current plan",
      currentBadge: "Current",
      recommended: "Recommended",
      freeTitle: "Free",
      freePrice: "₹0/month",
      freeNote: "Best for trying Visionix with basic limits.",
      freeFeatures: ["Limited CSV uploads", "Basic summaries", "Starter AI prompts"],
      proTitle: "Pro",
      proPrice: "₹1599/year",
      proNote: "Full AI insights, actions, reports, and advisor support.",
      proFeatures: ["Unlimited uploads", "Full decision feed", "Reports, alerts, and advisor chat"],
      upgrade: "Upgrade to Pro",
      active: "Premium access active",
      comingSoon: "Coming soon",
      waitlistNote: "Paid subscriptions are not live yet. Free users can review the plan details and pricing here.",
      deleteAccount: "Delete account",
      deleteTitle: "Delete this account?",
      deleteDescription: "This removes the current account and saved profile data from this browser so you can sign up fresh again with the same email.",
      deleteWarning: "This action clears the current local account record immediately.",
      deleteConfirm: "Delete and reset",
    },
    hi: {
      open: user?.plan === "pro" ? "योजना प्रबंधित करें" : "योजना देखें",
      title: "योजना और अपग्रेड",
      description: "फ्री और प्रो की तुलना करें और पूर्ण AI निर्णय खुफिया के लिए अपग्रेड करें।",
      current: "वर्तमान योजना",
      currentBadge: "वर्तमान",
      recommended: "अनुशंसित",
      freeTitle: "फ्री",
      freePrice: "₹0/महीना",
      freeNote: "Visionix को आधारभूत उपयोग के लिए मुफ्त में प्रयोग करें।",
      freeFeatures: ["सीमित CSV अपलोड", "बेसिक सारांश", "स्टार्टर AI प्रॉम्प्ट"],
      proTitle: "प्रो",
      proPrice: "₹1599/वर्ष",
      proNote: "पूर्ण AI इनसाइट्स, रिपोर्ट, अलर्ट और सलाहकार सहायता।",
      proFeatures: ["असीमित अपलोड", "पूर्ण निर्णय फ़ीड", "रिपोर्ट, अलर्ट और चैट"],
      upgrade: "प्रो में अपग्रेड करें",
      active: "प्रीमियम एक्सेस सक्रिय है",
      comingSoon: "जल्द आ रहा है",
      waitlistNote: "पेड सदस्यताएँ अभी लाइव नहीं हैं। फ्री उपयोगकर्ता प्लान विवरण और मूल्य देख सकते हैं।",
      deleteAccount: "खाता हटाएं",
      deleteTitle: "क्या आप यह खाता हटाना चाहते हैं?",
      deleteDescription: "यह ब्राउज़र से वर्तमान प्रोफ़ाइल डेटा हटा देगा ताकि आप उसी ईमेल से फिर से साइन अप कर सकें।",
      deleteWarning: "यह क्रिया वर्तमान स्थानीय खाता रिकॉर्ड को तुरंत साफ़ कर देगी।",
      deleteConfirm: "हटाएं और रीसेट करें",
    },
    te: {
      open: user?.plan === "pro" ? "ప్లాన్ నిర్వహించండి" : "ప్లాన్ చూడండి",
      title: "ప్లాన్ మరియు అప్‌గ్రేడ్‌లు",
      description: "ఫ్రీ మరియు ప్రోను పోల్చి, పూర్తి AI నిర్ణయ మేధస్సు కోసం అప్‌గ్రేడ్ చేయండి.",
      current: "ప్రస్తుత ప్లాన్",
      currentBadge: "ప్రస్తుత",
      recommended: "సిఫార్సు",
      freeTitle: "ఫ్రీ",
      freePrice: "₹0/నెల",
      freeNote: "Visionix ను ప్రాథమిక ఉపయోగానికి ఉచితంగా ఉపయోగించండి.",
      freeFeatures: ["పరిమిత CSV అప్లోడ్‌లు", "బేసిక్ సమరీస్", "స్టార్టర్ AI ప్రాంప్ట్‌లు"],
      proTitle: "ప్రో",
      proPrice: "₹1599/సంవత్సరం",
      proNote: "పూర్తి AI ఇన్సైట్స్, రిపోర్టులు, అలర్ట్స్ మరియు అడ్వైజర్ సపోర్ట్.",
      proFeatures: ["అనంత అప్లోడ్‌లు", "పూర్తి నిర్ణయ ఫీడ్", "రిపోర్టులు, అలర్ట్స్ మరియు చాట్"],
      upgrade: "ప్రోకు అప్‌గ్రేడ్ చేయండి",
      active: "ప్రీమియం యాక్సెస్ యాక్టివ్",
      comingSoon: "త్వరలో రాబోతుంది",
      waitlistNote: "పెయిడ్డ్ సబ్‌స్క్రిప్షన్లు ఇప్పుడే లైవ్‌లో లేవు. ఉచిత వినియోగదారులు ప్లాన్ వివరాలు మరియు ధరలను చూడవచ్చు.",
      deleteAccount: "ఖాతాను తొలగించండి",
      deleteTitle: "ఈ ఖాతాను తొలగించాలా?",
      deleteDescription: "ఇది బ్రౌజర్ నుండి ప్రస్తుత స్థానిక ప్రొఫైల్ డేటాను తొలగిస్తుంది, తద్వారా మీరు అదే ఇమెయిల్‌తో మళ్లీ సైన్ అప్ చేసుకోవచ్చు.",
      deleteWarning: "ఈ చర్య ప్రస్తుత స్థానిక ఖాతా రికార్డును వెంటనే శుభ్రం చేస్తుంది.",
      deleteConfirm: "తొలగించండి మరియు రీసెట్ చేయండి",
    },
  }[language]

  useEffect(() => {
    if (!user) return
    setName(user.name || "")
    setCompanyName(user.companyName || "")
    setSmbType(user.smbType || "")
    setBusinessType(user.businessType || "")
    setAvatar(user.avatar || "")
    setAvatarLoadFailed(false)
  }, [user, showProfileModal])

  const handleAvatarUpload = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatar(reader.result)
        setAvatarLoadFailed(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const openAvatarPicker = () => {
    avatarInputRef.current?.click()
  }

  const handleProfileSave = () => {
    if (!user || !name.trim()) return

    updateUser({
      name: name.trim(),
      avatar,
      companyName: companyName.trim(),
      smbType: smbType as "small" | "medium",
      businessType,
    })
    setShowProfileModal(false)
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-screen flex-col border-r border-border bg-sidebar pt-3 transition-all duration-700 ease-in-out",
          collapsed ? "w-[72px]" : "w-64"
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b border-border px-3 transition-all duration-700">
          <button
            onClick={() => setShowLogoModal(true)}
            className={cn(
              "flex cursor-pointer items-center gap-3 transition-all duration-700 hover:opacity-80",
              collapsed ? "w-full justify-center" : ""
            )}
          >
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg transition-transform duration-500 hover:scale-110 hover:rotate-3">
              <Image
                src="/visionix-logo.png"
                alt="Visionix Logo"
                fill
                className="object-cover"
                priority
              />
            </div>
            <span
              className={cn(
                "text-lg font-bold tracking-tight text-foreground transition-all duration-700",
                collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
              )}
            >
              Visionix
            </span>
          </button>
          
          {user?.isAdmin && !collapsed && (
            <NextLink href="/admin" className="ml-2 flex items-center justify-center rounded-lg border border-blue-200/50 bg-blue-500/10 p-1.5 text-blue-800 transition-colors hover:bg-blue-500/20 dark:border-white/10 dark:text-cyan-200">
              <ShieldCheck className="h-4 w-4" />
            </NextLink>
          )}
        </div>

        <Dialog open={showLogoModal} onOpenChange={setShowLogoModal}>
          <DialogContent className="border-border bg-card sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-foreground">
                Visionix
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="relative h-64 w-64 animate-in zoom-in-50 duration-500">
                <Image
                  src="/visionix-logo.png"
                  alt="Visionix Logo"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="space-y-2 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                <p className="text-lg font-semibold text-foreground">
                  AI Decision Intelligence Platform
                </p>
                <p className="text-sm text-muted-foreground">
                  Decisions, reasoning, and actions for small business owners
                </p>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showProfileModal} onOpenChange={setShowProfileModal}>
          <DialogContent className="border-border bg-card sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                {copy.profileTitle}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {copy.profileDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-[28px] border border-blue-200/50 bg-white/70 p-5 dark:border-white/10 dark:bg-white/6">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
              />
              <FieldGroup>
                <Field>
                  <FieldLabel>{copy.photo}</FieldLabel>
                  <div className="flex flex-col gap-4 rounded-[24px] border border-blue-200/50 bg-white/80 p-4 dark:border-white/10 dark:bg-slate-950/40 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-[linear-gradient(135deg,#62c8ff_0%,#2d63ff_100%)] text-xl font-bold text-white shadow-[0_14px_35px_rgba(45,99,255,0.28)]">
                        {avatar && !avatarLoadFailed ? (
                          <img
                            src={avatar}
                            alt={name || user?.name || "Profile"}
                            className="h-full w-full object-cover"
                            onError={() => setAvatarLoadFailed(true)}
                          />
                        ) : (
                          userInitial
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{copy.uploadPhoto}</p>
                        <p className="text-xs text-muted-foreground">{copy.photoHint}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={openAvatarPicker}
                      className="rounded-2xl border-blue-200/60 bg-white/90 dark:border-white/10 dark:bg-white/6"
                    >
                      <ImagePlus className="mr-2 h-4 w-4" />
                      {copy.uploadPhoto}
                    </Button>
                  </div>
                </Field>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>{copy.fullName}</FieldLabel>
                    <div className="relative">
                      <PencilLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={copy.fullNamePlaceholder}
                        className="h-11 border-blue-200/60 bg-white pl-10 dark:border-white/10 dark:bg-slate-950/50"
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel>{copy.email}</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={user?.email || ""}
                        readOnly
                        className="h-11 border-blue-200/60 bg-slate-100 pl-10 text-muted-foreground dark:border-white/10 dark:bg-slate-900/80"
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>{copy.companyName}</FieldLabel>
                    <div className="relative">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={companyName}
                        onChange={(event) => setCompanyName(event.target.value)}
                        placeholder={copy.companyPlaceholder}
                        className="h-11 border-blue-200/60 bg-white pl-10 dark:border-white/10 dark:bg-slate-950/50"
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel>{language === "te" ? "వ్యాపార స్థాయి" : language === "hi" ? "व्यवसाय का पैमाना" : "Business Scale"}</FieldLabel>
                    <div className="relative">
                      <Briefcase className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Select value={smbType} onValueChange={(v) => setSmbType(v as any)}>
                        <SelectTrigger className="h-11 border-blue-200/60 bg-white pl-10 dark:border-white/10 dark:bg-slate-950/50">
                          <SelectValue placeholder="Select scale" />
                        </SelectTrigger>
                        <SelectContent>
                          {smbOptions[language].map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>{language === "te" ? "మీరు ఏ వ్యాపారం చేస్తారు?" : language === "hi" ? "आप क्या व्यवसाय करते हैं?" : "What business do you do?"}</FieldLabel>
                  <div className="relative">
                    <Database className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={businessType}
                      onChange={(event) => setBusinessType(event.target.value)}
                      placeholder="e.g. Retail, Pharmacy, Cafe..."
                      className="h-11 border-blue-200/60 bg-white pl-10 dark:border-white/10 dark:bg-slate-950/50"
                    />
                  </div>
                </Field>
              </FieldGroup>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button type="button" variant="ghost" onClick={() => setShowProfileModal(false)} className="rounded-2xl">
                  {copy.cancel}
                </Button>
                <Button
                  type="button"
                  onClick={handleProfileSave}
                  disabled={!name.trim()}
                  className="rounded-2xl bg-[linear-gradient(135deg,#56c7ff_0%,#2253ff_100%)] text-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {copy.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showPlansModal} onOpenChange={setShowPlansModal}>
          <DialogContent className="border-border bg-card sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                {planUi.title}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {planUi.description}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[28px] border border-blue-200/50 bg-white/75 p-5 dark:border-white/10 dark:bg-white/6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{planUi.freeTitle}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{planUi.freePrice}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{planUi.freeNote}</p>
                  </div>
                  {user?.plan === "free" && (
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                      {planUi.currentBadge}
                    </span>
                  )}
                </div>
                <div className="mt-5 space-y-3">
                  {planUi.freeFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      <p className="text-sm leading-6 text-foreground/90">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-amber-300/30 bg-amber-400/10 p-5 shadow-[0_18px_40px_rgba(251,191,36,0.12)] dark:border-amber-300/20 dark:bg-amber-400/8">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{planUi.proTitle}</p>
                    <p className="mt-2 text-3xl font-bold text-foreground">{planUi.proPrice}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{planUi.proNote}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-100">
                      {planUi.recommended}
                    </span>
                    {user?.plan === "pro" && (
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-100">
                        {planUi.currentBadge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {planUi.proFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      <p className="text-sm leading-6 text-foreground/90">{feature}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-blue-200/50 bg-white/70 p-4 dark:border-white/10 dark:bg-white/6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-cyan-200">
                    {planUi.current}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">{planLabel}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {user?.plan === "pro" ? planUi.active : planUi.waitlistNote}
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    if (user?.plan === "pro") return
                  }}
                  disabled={user?.plan !== "free" ? true : false}
                  className={cn(
                    "rounded-2xl text-white",
                    user?.plan === "pro"
                      ? "bg-emerald-600 hover:bg-emerald-600"
                      : "bg-slate-500 hover:bg-slate-500 dark:bg-slate-700 dark:hover:bg-slate-700"
                  )}
                >
                  {user?.plan === "pro" ? (
                    <>
                      <Crown className="mr-2 h-4 w-4" />
                      {planUi.active}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {planUi.comingSoon}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="border-border bg-card sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-foreground">
                {planUi.deleteTitle}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {planUi.deleteDescription}
              </DialogDescription>
            </DialogHeader>

            <div className="rounded-[24px] border border-rose-300/25 bg-rose-500/10 p-4">
              <p className="text-sm leading-6 text-rose-100">{planUi.deleteWarning}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowDeleteModal(false)} className="rounded-2xl">
                {copy.cancel}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false)
                  deleteCurrentUser()
                }}
                className="rounded-2xl bg-rose-600 text-white hover:bg-rose-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {planUi.deleteConfirm}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {user && !collapsed && (
          <div className="animate-in fade-in border-b border-border px-3 py-4 duration-500">
            <div className="rounded-[24px] border border-blue-200/50 bg-white/70 p-4 shadow-[0_18px_50px_rgba(70,110,195,0.12)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_26px_60px_rgba(70,110,195,0.18)] dark:border-white/10 dark:bg-white/6 dark:shadow-none">
              <div className="mb-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setShowPlansModal(true)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] transition-transform duration-300 hover:scale-105",
                    planClassName
                  )}
                >
                  {planLabel}
                </button>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#62c8ff_0%,#2d63ff_100%)] text-lg font-bold text-white shadow-[0_12px_30px_rgba(45,99,255,0.28)]">
                  {user.avatar && !avatarLoadFailed ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-12 w-12 rounded-2xl object-cover"
                      onError={() => setAvatarLoadFailed(true)}
                    />
                  ) : (
                    userInitial
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-blue-800 dark:text-cyan-200">
                    {copy.workspace}
                  </p>
                  <p className="mt-1 text-xl font-bold leading-tight text-slate-950 dark:text-white">
                    {user.name}
                  </p>
                  <p className="mt-1 break-all text-sm font-medium leading-5 text-slate-600 dark:text-muted-foreground">
                    {user.email}
                  </p>
                  {user.companyName && (
                    <p className="mt-2 text-sm font-semibold text-blue-800 dark:text-cyan-200">
                      {user.companyName}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowProfileModal(true)}
                className="mt-4 h-10 w-full justify-start rounded-2xl border border-blue-200/60 bg-white/80 text-sm font-bold text-slate-800 transition-all duration-300 hover:bg-blue-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Camera className="mr-2 h-4 w-4" />
                {copy.editProfile}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowPlansModal(true)}
                className="mt-3 h-10 w-full justify-start rounded-2xl border border-blue-200/60 bg-white/80 text-sm font-medium text-slate-700 transition-all duration-300 hover:bg-blue-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/6 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <Crown className="mr-2 h-4 w-4" />
                {planUi.open}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteModal(true)}
                className="mt-3 h-10 w-full justify-start rounded-2xl border border-rose-300/25 bg-rose-500/8 text-sm font-medium text-rose-200 transition-all duration-300 hover:bg-rose-500/14 hover:text-white"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {planUi.deleteAccount}
              </Button>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3">
          <ul className="space-y-1">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeView === item.id

              return (
                <li
                  key={item.id}
                  className="animate-in slide-in-from-left-2 duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onViewChange(item.id)}
                        className={cn(
                          "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-500",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                            : "text-muted-foreground hover:translate-x-1 hover:bg-secondary hover:text-foreground hover:shadow-md"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-all duration-500",
                            !isActive && "group-hover:scale-110 group-hover:rotate-6"
                          )}
                        />
                        <span
                          className={cn(
                            "transition-all duration-700",
                            collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
                          )}
                        >
                          {item.label[language]}
                        </span>
                      </button>
                    </TooltipTrigger>
                    {collapsed && (
                      <TooltipContent side="right" className="transition-all duration-500">
                        {item.label[language]}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-border p-3 transition-colors duration-500">
          {!collapsed && (
            <div className="space-y-2 rounded-2xl border border-blue-200/50 bg-white/70 p-3 dark:border-white/10 dark:bg-white/6">
              <span className="text-sm text-muted-foreground transition-all duration-500">
                {copy.language}
              </span>
              <LanguageSwitcher />
            </div>
          )}

          <div
            className={cn(
              "flex items-center transition-all duration-700",
              collapsed ? "justify-center" : "justify-between px-1"
            )}
          >
            {!collapsed && (
              <span className="text-sm text-muted-foreground transition-all duration-500">
                {copy.theme}
              </span>
            )}
            <ThemeToggle />
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className={cn(
                  "w-full text-muted-foreground transition-all duration-500 hover:bg-destructive/10 hover:text-destructive",
                  collapsed ? "justify-center px-0" : "justify-start"
                )}
              >
                <LogOut className="h-4 w-4 transition-transform duration-500 hover:scale-110" />
                <span
                  className={cn(
                    "ml-2 transition-all duration-700",
                    collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
                  )}
                >
                  {copy.logout}
                </span>
              </Button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right">{copy.logout}</TooltipContent>}
          </Tooltip>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "w-full text-muted-foreground transition-all duration-500 hover:text-foreground",
              collapsed ? "justify-center px-0" : "justify-start"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center transition-transform duration-700",
                collapsed ? "rotate-180" : "rotate-0"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
            </div>
            <span
              className={cn(
                "ml-2 transition-all duration-700",
                collapsed ? "w-0 overflow-hidden opacity-0" : "opacity-100"
              )}
            >
              {copy.collapse}
            </span>
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
