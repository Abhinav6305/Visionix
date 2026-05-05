"use client"

import { ChevronDown, Languages } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { languageMeta, useLanguage } from "@/lib/language-context"

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={`flex items-center justify-between gap-2 rounded-2xl border border-blue-200/60 bg-white/80 px-3 py-2 text-sm font-medium shadow-[0_10px_30px_rgba(70,110,195,0.10)] transition-colors duration-200 hover:border-blue-300 dark:border-white/10 dark:bg-white/6 dark:shadow-none ${
          compact ? "w-fit" : "w-full"
        }`}
      >
        <div className="flex items-center gap-2">
          <Languages className="h-4 w-4 text-blue-700 dark:text-cyan-200" />
          <span className="min-w-0 truncate">{languageMeta[language].native}</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-300" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="min-w-[12rem]">
        {Object.entries(languageMeta).map(([code, meta]) => (
          <DropdownMenuItem
            key={code}
            onSelect={() => setLanguage(code as keyof typeof languageMeta)}
            className={`flex items-center justify-between gap-2 px-3 ${
              code === language ? "bg-blue-100 text-blue-900 dark:bg-cyan-500/10 dark:text-cyan-100" : "text-foreground"
            }`}
          >
            <span>{meta.native}</span>
            <span className="text-xs text-muted-foreground">{meta.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
