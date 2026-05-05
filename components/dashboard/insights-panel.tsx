"use client"

import { useMemo, useState } from "react"
import { MessageSquareText, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"

export interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface InsightsPanelProps {
  messages: ChatMessage[]
  onSend: (message: string) => void
  isLoading?: boolean
}

export function InsightsPanel({ messages, onSend, isLoading = false }: InsightsPanelProps) {
  const [draft, setDraft] = useState("")
  const { language } = useLanguage()

  const copy = {
    en: {
      empty: "Ask me what is going wrong, why it happened, or what you should do today.",
      title: "AI Advisor",
      assistant: "Visionix Advisor",
      you: "You",
      loading: "Visionix is thinking through your next move...",
      placeholder: "Why did sales drop? What should I do this week?",
    },
    hi: {
      empty: "मुझसे पूछें क्या गलत हो रहा है, क्यों हुआ, और आज आपको क्या करना चाहिए।",
      title: "एआई सलाहकार",
      assistant: "Visionix सलाहकार",
      you: "आप",
      loading: "Visionix आपके अगले कदम पर विचार कर रहा है...",
      placeholder: "बिक्री क्यों घटी? मुझे इस सप्ताह क्या करना चाहिए?",
    },
    te: {
      empty: "ఏం తప్పు జరుగుతోంది, ఎందుకు జరిగింది, ఈరోజు మీరు ఏమి చేయాలో నన్ను అడగండి.",
      title: "ఏఐ సలహాదారు",
      assistant: "Visionix సలహాదారు",
      you: "మీరు",
      loading: "Visionix మీ తదుపరి అడుగు గురించి ఆలోచిస్తోంది...",
      placeholder: "అమ్మకాలు ఎందుకు తగ్గాయి? ఈ వారం నేను ఏమి చేయాలి?",
    },
  }[language]

  const displayMessages = useMemo(() => {
    if (messages.length > 0) return messages.slice(-8)
    return [
      {
        role: "assistant" as const,
        content: copy.empty,
      },
    ]
  }, [copy.empty, messages])

  return (
    <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/75 dark:border-white/10 dark:bg-white/6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3 text-base font-semibold text-slate-950 dark:text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-200">
            <MessageSquareText className="h-5 w-5" />
          </div>
          {copy.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
          {displayMessages.map((message, index) => {
            const cleanContent = message.content.replace(/\*\*/g, "").replace(/\*/g, "")
            return (
              <div
                key={`${message.role}-${index}`}
                className={`rounded-[24px] border p-5 text-sm leading-8 transition-all duration-300 ${
                  message.role === "assistant"
                    ? "mr-8 border-blue-100 bg-white/90 shadow-[0_12px_30px_rgba(34,83,255,0.06)] text-slate-800 dark:border-white/10 dark:bg-slate-950/60 dark:text-slate-100"
                    : "ml-8 border-cyan-300/30 bg-cyan-400/15 text-cyan-950 shadow-[0_12px_30px_rgba(34,211,238,0.06)] dark:text-cyan-50"
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-blue-700/70 dark:text-cyan-200/60">
                    {message.role === "assistant" ? copy.assistant : copy.you}
                  </div>
                </div>
                <div className="whitespace-pre-wrap font-medium">{cleanContent}</div>
              </div>
            )
          })}

          {isLoading && (
            <div className="mr-6 rounded-3xl border border-blue-100 bg-white/80 p-4 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-950/55 dark:text-slate-300">
              {copy.loading}
            </div>
          )}
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            const next = draft.trim()
            if (!next || isLoading) return
            setDraft("")
            onSend(next)
          }}
          className="flex gap-2"
        >
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={isLoading}
            placeholder={copy.placeholder}
            className="min-w-0 flex-1 rounded-2xl border border-blue-200 bg-white/85 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 dark:border-white/10 dark:bg-slate-950/50 dark:text-white"
          />
          <Button
            type="submit"
            disabled={isLoading || !draft.trim()}
            className="h-auto rounded-2xl bg-[linear-gradient(135deg,#56c7ff_0%,#2253ff_100%)] px-4 text-white"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
