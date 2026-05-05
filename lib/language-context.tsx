"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

export type LanguageCode = "en" | "hi" | "te"

type LanguageContextType = {
  language: LanguageCode
  setLanguage: (language: LanguageCode) => void
}

export const languageMeta: Record<LanguageCode, { label: string; native: string }> = {
  en: { label: "English", native: "English" },
  hi: { label: "Hindi", native: "हिन्दी" },
  te: { label: "Telugu", native: "తెలుగు" },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en")

  useEffect(() => {
    const storedLanguage = localStorage.getItem("visionix_language") as LanguageCode | null
    if (storedLanguage && storedLanguage in languageMeta) {
      setLanguageState(storedLanguage)
      document.documentElement.lang = storedLanguage
    }
  }, [])

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage)
    localStorage.setItem("visionix_language", nextLanguage)
    document.documentElement.lang = nextLanguage
  }

  const value = useMemo(() => ({ language, setLanguage }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
