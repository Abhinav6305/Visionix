"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { Building2, Briefcase, Database, ArrowRight, CheckCircle2 } from "lucide-react"

export default function SetupPage() {
  const [companyName, setCompanyName] = useState("")
  const [smbType, setSmbType] = useState<"small" | "medium" | "">("")
  const [businessType, setBusinessType] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user, updateUser, isLoading: authLoading } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const copy = {
    en: {
      title: "Complete Your Profile",
      description: `Welcome, ${user?.name || ""}! Tell us about your business to personalize your experience.`,
      account: "Account",
      setup: "Setup",
      dashboard: "Dashboard",
      companyName: "Business Name",
      companyPlaceholder: "Acme Store",
      smbType: "Business Scale",
      smbPlaceholder: "Select business scale",
      businessType: "What business do you do?",
      businessPlaceholder: "e.g. Retail, Pharmacy, Cafe...",
      button: "Continue to Dashboard",
      loading: "Setting up...",
    },
    hi: {
      title: "अपना प्रोफ़ाइल पूरा करें",
      description: `स्वागत है, ${user?.name || ""}! अपने अनुभव को व्यक्तिगत बनाने के लिए अपने व्यवसाय के बारे में बताइए।`,
      account: "खाता",
      setup: "सेटअप",
      dashboard: "डैशबोर्ड",
      companyName: "व्यवसाय का नाम",
      companyPlaceholder: "Acme Store",
      smbType: "व्यवसाय का पैमाना",
      smbPlaceholder: "पैमाना चुनें",
      businessType: "आप क्या व्यवसाय करते हैं?",
      businessPlaceholder: "जैसे खुदरा, फार्मेसी, कैफे...",
      button: "डैशबोर्ड पर जाएँ",
      loading: "सेटअप हो रहा है...",
    },
    te: {
      title: "మీ ప్రొఫైల్‌ను పూర్తి చేయండి",
      description: `స్వాగతం, ${user?.name || ""}! మీ అనుభవాన్ని వ్యక్తిగతీకరించడానికి మీ వ్యాపారం గురించి చెప్పండి.`,
      account: "ఖాతా",
      setup: "సెటప్",
      dashboard: "డాష్‌బోర్డ్",
      companyName: "వ్యాపార పేరు",
      companyPlaceholder: "Acme Store",
      smbType: "వ్యాపార స్థాయి",
      smbPlaceholder: "స్థాయిని ఎంచుకోండి",
      businessType: "మీరు ఏ వ్యాపారం చేస్తారు?",
      businessPlaceholder: "ఉదా. రిటైల్, ఫార్మసీ, కేఫ్...",
      button: "డాష్‌బోర్డ్‌కు కొనసాగండి",
      loading: "సెటప్ జరుగుతోంది...",
    },
  }[language]

  const smbTypes = {
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
  }[language]

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!companyName || !smbType || !businessType) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    updateUser({
      companyName,
      smbType: smbType as "small" | "medium",
      businessType,
      isSetupComplete: true,
    })

    router.push("/dashboard")
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-chart-2/5 rounded-full blur-3xl pointer-events-none" />

      {/* Form */}
      <div className="relative z-10 px-6 pt-6">
        <div className="flex justify-end">
          <LanguageSwitcher compact />
        </div>
      </div>
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg border-border bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                <Image src="/visionix-logo.png" alt="Visionix" fill className="object-cover" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-950 dark:text-white">{copy.title}</CardTitle>
            <CardDescription className="text-slate-800 dark:text-slate-400">{copy.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Progress Steps */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground hidden sm:inline">{copy.account}</span>
                </div>
                <div className="w-8 h-0.5 bg-primary" />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-foreground">2</span>
                  </div>
                  <span className="text-sm text-foreground font-medium hidden sm:inline">{copy.setup}</span>
                </div>
                <div className="w-8 h-0.5 bg-border" />
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-secondary flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-600 dark:text-muted-foreground">3</span>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-muted-foreground hidden sm:inline">{copy.dashboard}</span>
                </div>
              </div>

              <FieldGroup>
                <Field>
                  <FieldLabel>{copy.companyName}</FieldLabel>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={copy.companyPlaceholder}
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="pl-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>{copy.smbType}</FieldLabel>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                    <Select value={smbType} onValueChange={(v) => setSmbType(v as any)} disabled={isLoading}>
                      <SelectTrigger className="pl-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder={copy.smbPlaceholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {smbTypes.map((t) => (
                          <SelectItem key={t.value} value={t.value} className="cursor-pointer">
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </Field>

                <Field>
                  <FieldLabel>{copy.businessType}</FieldLabel>
                  <div className="relative">
                    <Database className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
                    <Input
                      type="text"
                      placeholder={copy.businessPlaceholder}
                      value={businessType}
                      onChange={(e) => setBusinessType(e.target.value)}
                      className="pl-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full h-11 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                disabled={isLoading || !companyName || !smbType || !businessType}
              >
                {isLoading ? (
                  <>
                    <Spinner size={16} className="mr-2" />
                    {copy.loading}
                  </>
                ) : (
                  <>
                    {copy.button}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
