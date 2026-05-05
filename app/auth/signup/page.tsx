"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock, AlertCircle } from "lucide-react"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { signup } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const copy = {
    en: {
      back: "Back to home",
      title: "Create an account",
      description: "Start your journey with Visionix",
      fullName: "Full Name",
      email: "Email",
      password: "Password",
      namePlaceholder: "John Doe",
      emailPlaceholder: "john@company.com",
      passwordPlaceholder: "Min. 6 characters",
      button: "Create Account",
      loading: "Creating account...",
      haveAccount: "Already have an account?",
      login: "Log in",
    },
    hi: {
      back: "होम पर वापस जाएँ",
      title: "खाता बनाएँ",
      description: "Visionix के साथ अपनी यात्रा शुरू करें",
      fullName: "पूरा नाम",
      email: "ईमेल",
      password: "पासवर्ड",
      namePlaceholder: "John Doe",
      emailPlaceholder: "john@company.com",
      passwordPlaceholder: "कम से कम 6 अक्षर",
      button: "खाता बनाएँ",
      loading: "खाता बनाया जा रहा है...",
      haveAccount: "क्या आपके पास पहले से खाता है?",
      login: "लॉगिन",
    },
    te: {
      back: "హోమ్‌కు తిరిగి వెళ్ళండి",
      title: "ఖాతా సృష్టించండి",
      description: "Visionix తో మీ ప్రయాణాన్ని ప్రారంభించండి",
      fullName: "పూర్తి పేరు",
      email: "ఇమెయిల్",
      password: "పాస్‌వర్డ్",
      namePlaceholder: "John Doe",
      emailPlaceholder: "john@company.com",
      passwordPlaceholder: "కనీసం 6 అక్షరాలు",
      button: "ఖాతా సృష్టించండి",
      loading: "ఖాతా సృష్టిస్తోంది...",
      haveAccount: "ఇప్పటికే ఖాతా ఉందా?",
      login: "లాగిన్",
    },
  }[language]

  const validateForm = () => {
    if (!name.trim()) {
      setError("Name is required")
      return false
    }
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) return

    setIsLoading(true)
    const result = await signup(name, email, password)
    setIsLoading(false)

    if (result.success) {
      router.push("/setup")
    } else {
      setError(result.error || "Something went wrong")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-primary/10 pointer-events-none" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Back Link */}
      <div className="relative z-10 flex items-center justify-between p-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">
          <ArrowLeft className="h-4 w-4" />
          {copy.back}
        </Link>
        <LanguageSwitcher compact />
      </div>

      {/* Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 pb-12">
        <Card className="w-full max-w-md border-border bg-card/80 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="relative h-14 w-14 overflow-hidden rounded-xl">
                <Image src="/visionix-logo.png" alt="Visionix" fill className="object-cover" />
              </div>
            </div>
            <CardTitle className="text-2xl">{copy.title}</CardTitle>
            <CardDescription>{copy.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <FieldGroup>
                <Field>
                  <FieldLabel>{copy.fullName}</FieldLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder={copy.namePlaceholder}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>{copy.email}</FieldLabel>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder={copy.emailPlaceholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel>{copy.password}</FieldLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={copy.passwordPlaceholder}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-11 transition-all duration-300 focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>
              </FieldGroup>

              <Button
                type="submit"
                className="w-full h-11 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size={16} className="mr-2" />
                    {copy.loading}
                  </>
                ) : (
                  copy.button
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {copy.haveAccount}{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium transition-colors">
                  {copy.login}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
