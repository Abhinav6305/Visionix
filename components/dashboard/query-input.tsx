"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, BrainCircuit, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/language-context"

interface QueryInputProps {
  onSubmit: (query: string) => void
  isLoading: boolean
  disabled?: boolean
}

export function QueryInput({ onSubmit, isLoading, disabled = false }: QueryInputProps) {
  const [query, setQuery] = useState("")
  const { language } = useLanguage()

  const copy = {
    en: {
      placeholder: "Ask Visionix for a decision, not a chart...",
      thinking: "Thinking",
      button: "Get Decision",
      prompts: [
        "What should I do today?",
        "Where am I losing money?",
        "What should I restock first?",
        "Which products need attention?",
      ],
    },
    hi: {
      placeholder: "Visionix से निर्णय पूछें, चार्ट नहीं...",
      thinking: "सोच रहा है",
      button: "निर्णय पाएं",
      prompts: [
        "मुझे आज क्या करना चाहिए?",
        "मैं कहाँ पैसा खो रहा हूँ?",
        "मुझे पहले क्या रीस्टॉक करना चाहिए?",
        "किन उत्पादों पर ध्यान देना चाहिए?",
      ],
    },
    te: {
      placeholder: "Visionix ను నిర్ణయం కోసం అడగండి, చార్ట్ కోసం కాదు...",
      thinking: "ఆలోచిస్తోంది",
      button: "నిర్ణయం పొందండి",
      prompts: [
        "నేను ఈరోజు ఏమి చేయాలి?",
        "నేను ఎక్కడ డబ్బు కోల్పోతున్నాను?",
        "మొదట ఏవి రీస్టాక్ చేయాలి?",
        "ఏ ఉత్పత్తులకు శ్రద్ధ అవసరం?",
      ],
    },
  }[language]

  const submit = (value: string) => {
    const next = value.trim()
    if (!next) return
    setQuery(next)
    onSubmit(next)
  }

  return (
    <div className="space-y-4">
      <motion.form
        initial={{ opacity: 0.88, y: 18, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        whileHover={{ y: -6, scale: 1.006 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={(event) => {
          event.preventDefault()
          submit(query)
        }}
        className="motion-surface rounded-[28px] border border-blue-200/50 bg-white/75 p-3 shadow-[0_18px_60px_rgba(72,112,191,0.15)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6 dark:shadow-[0_18px_60px_rgba(0,0,0,0.25)]"
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <motion.div
            animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.04, 1] }}
            transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200"
          >
            <BrainCircuit className="h-6 w-6" />
          </motion.div>
          <input
            type="text"
            placeholder={copy.placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            disabled={isLoading || disabled}
            className="min-w-0 flex-1 bg-transparent px-1 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button
            type="submit"
            disabled={isLoading || disabled || !query.trim()}
            className="h-12 rounded-2xl bg-[linear-gradient(135deg,#56c7ff_0%,#2253ff_100%)] px-5 text-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(34,83,255,0.32)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {copy.thinking}
              </>
            ) : (
              <>
                {copy.button}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </motion.form>

      <div className="flex flex-wrap gap-2">
        {copy.prompts.map((prompt, index) => (
          <motion.button
            key={prompt}
            type="button"
            disabled={isLoading || disabled}
            onClick={() => submit(prompt)}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: index * 0.06 }}
            whileHover={{ y: -5, scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm text-slate-700 transition-all duration-500 hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-slate-950 hover:shadow-[0_14px_30px_rgba(34,211,238,0.14)] disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </div>
  )
}
