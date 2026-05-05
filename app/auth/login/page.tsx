"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertCircle, Eye, EyeOff, Lock, Mail } from "lucide-react"

import { LanguageSwitcher } from "@/components/language-switcher"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"

declare global {
  interface Window {
    google?: any
  }
}

type GoogleCredentialResponse = {
  credential?: string
}

function decodeJwtPayload(token: string) {
  const payload = token.split(".")[1]
  const normalized = payload.replace(/-/g, "+").replace(/_/g, "/")
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=")
  return JSON.parse(atob(padded))
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement | null>(null)

  const { login, loginWithGoogle } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const googleClientId = useMemo(() => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "", [])
  const copy = {
    en: {
      back: "Back to home",
      title: "Welcome back",
      description: "Log in to your Visionix AI advisor",
      google: "Continue with Google",
      divider: "or use email",
      email: "Email",
      password: "Password",
      emailPlaceholder: "john@company.com",
      passwordPlaceholder: "Enter your password",
      button: "Log In",
      loading: "Logging in...",
      signup: "Sign up",
      noAccount: "Don't have an account?",
    },
    hi: {
      back: "होम पर वापस जाएँ",
      title: "वापसी पर स्वागत है",
      description: "अपने Visionix एआई सलाहकार में लॉगिन करें",
      google: "Google के साथ जारी रखें",
      divider: "या ईमेल का उपयोग करें",
      email: "ईमेल",
      password: "पासवर्ड",
      emailPlaceholder: "john@company.com",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      button: "लॉगिन",
      loading: "लॉगिन हो रहा है...",
      signup: "साइन अप करें",
      noAccount: "क्या आपका खाता नहीं है?",
    },
    te: {
      back: "హోమ్‌కు తిరిగి వెళ్ళండి",
      title: "మళ్లీ స్వాగతం",
      description: "మీ Visionix ఏఐ సలహాదారులో లాగిన్ అవ్వండి",
      google: "Google తో కొనసాగించండి",
      divider: "లేదా ఇమెయిల్ ఉపయోగించండి",
      email: "ఇమెయిల్",
      password: "పాస్‌వర్డ్",
      emailPlaceholder: "john@company.com",
      passwordPlaceholder: "మీ పాస్‌వర్డ్ నమోదు చేయండి",
      button: "లాగిన్",
      loading: "లాగిన్ అవుతోంది...",
      signup: "సైన్ అప్",
      noAccount: "మీకు ఖాతా లేదా?",
    },
  }[language]

  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current || !googleClientId) return
      googleButtonRef.current.innerHTML = ""
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: GoogleCredentialResponse) => {
          try {
            setError("")
            setIsLoading(true)
            if (!response.credential) throw new Error("Google sign-in did not return a credential.")
            const payload = decodeJwtPayload(response.credential)
            const result = await loginWithGoogle({
              name: payload.name,
              email: payload.email,
              picture: payload.picture,
            })
            if (!result.success) throw new Error(result.error || "Google login failed.")
            const storedUser = localStorage.getItem("visionix_user")
            const nextUser = storedUser ? JSON.parse(storedUser) : null
            router.push(nextUser?.isSetupComplete ? "/dashboard" : "/setup")
          } catch (authError) {
            setError(authError instanceof Error ? authError.message : "Google login failed.")
          } finally {
            setIsLoading(false)
          }
        },
      })
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        shape: "pill",
        text: "continue_with",
      })
    }

    initializeGoogle()
    window.addEventListener("google-loaded", initializeGoogle)
    return () => window.removeEventListener("google-loaded", initializeGoogle)
  }, [googleClientId, loginWithGoogle, router])

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address")
      return false
    }
    if (!password) {
      setError("Password is required")
      return false
    }
    return true
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (!validateForm()) return

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (result.success) {
      const storedUser = localStorage.getItem("visionix_user")
      if (storedUser) {
        const user = JSON.parse(storedUser)
        router.push(user.isSetupComplete ? "/dashboard" : "/setup")
      }
    } else {
      setError(result.error || "Something went wrong")
    }
  }

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => window.dispatchEvent(new Event("google-loaded"))}
      />

      <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,rgba(246,250,255,1)_0%,rgba(223,236,255,1)_42%,rgba(195,220,255,1)_100%)] dark:bg-[radial-gradient(circle_at_top,rgba(18,96,255,0.2),transparent_28%),linear-gradient(180deg,#07111f_0%,#060b14_100%)]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40 dark:opacity-10" />
        <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-blue-300/45 blur-3xl dark:bg-cyan-500/15" />
        <div className="pointer-events-none absolute bottom-[-12%] right-[-8%] h-[420px] w-[420px] rounded-full bg-cyan-300/45 blur-3xl dark:bg-blue-600/15" />

        <div className="relative z-10 flex items-center justify-between p-6">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-700 transition hover:text-slate-950 dark:text-slate-300 dark:hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            {copy.back}
          </Link>
          <LanguageSwitcher compact />
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-88px)] items-center justify-center px-4 pb-12">
          <Card className="w-full max-w-md rounded-[30px] border border-blue-200/80 bg-white/80 shadow-[0_35px_90px_rgba(46,97,188,0.18)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 dark:shadow-[0_35px_90px_rgba(0,0,0,0.42)]">
            <CardHeader className="pb-2 text-center">
              <div className="mb-5 flex justify-center">
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl ring-1 ring-blue-200 dark:ring-white/10">
                  <Image src="/visionix-logo.png" alt="Visionix" fill className="object-cover" />
                </div>
              </div>
              <CardTitle className="text-3xl text-slate-950 dark:text-white">{copy.title}</CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {copy.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-rose-300/40 bg-rose-500/10 p-3 text-sm text-rose-700 dark:text-rose-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="rounded-[24px] border border-blue-100 bg-blue-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700 dark:text-cyan-200">
                  {copy.google}
                </p>
                {googleClientId ? (
                  <div ref={googleButtonRef} className="flex justify-center" />
                ) : (
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Google sign-in is not configured yet.
                  </p>
                )}
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-blue-100 dark:border-white/10" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-slate-500 dark:bg-slate-950 dark:text-slate-400">{copy.divider}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>{copy.email}</FieldLabel>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type="email"
                        placeholder={copy.emailPlaceholder}
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="h-11 rounded-2xl border-blue-100 bg-white/90 pl-10 text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                        disabled={isLoading}
                      />
                    </div>
                  </Field>

                  <Field>
                    <FieldLabel>{copy.password}</FieldLabel>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder={copy.passwordPlaceholder}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        className="h-11 rounded-2xl border-blue-100 bg-white/90 pl-10 pr-10 text-slate-900 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-900 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                </FieldGroup>

                <Button
                  type="submit"
                  className="h-11 w-full rounded-2xl bg-[linear-gradient(135deg,#62c8ff_0%,#2d63ff_100%)] text-white shadow-[0_18px_44px_rgba(45,99,255,0.32)] transition hover:scale-[1.01]"
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

                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  {copy.noAccount}{" "}
                  <Link href="/auth/signup" className="font-medium text-blue-700 transition hover:underline dark:text-cyan-200">
                    {copy.signup}
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
