"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowUpRight,
  BellRing,
  BrainCircuit,
  CheckCircle2,
  FileDown,
  FileSpreadsheet,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  X,
} from "lucide-react"

import {
  DynamicBarChart,
  DynamicLineChart,
} from "@/components/dashboard/chart-cards"
import { InsightsPanel, type ChatMessage } from "@/components/dashboard/insights-panel"
import { QueryInput } from "@/components/dashboard/query-input"
import { Sidebar } from "@/components/dashboard/sidebar"
import { VoiceOCRSection } from "@/components/dashboard/voice-ocr-section"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { useLanguage } from "@/lib/language-context"

type View = "overview" | "insights" | "chat" | "reports"

interface UploadedData {
  columns: string[]
  rows: Record<string, string>[]
  fileName: string
}

interface DecisionItem {
  id: string
  title: string
  priority: "high" | "medium" | "low"
  kind: "problem" | "opportunity" | "warning"
  problem: string
  reason: string
  action: string
  confidence: number
  explanation: string
  impact_label: string
  metric_value: string
}

interface AlertItem {
  id: string
  severity: "problem" | "warning" | "opportunity"
  title: string
  message: string
  whatsapp_preview: string
}

interface ChartItem {
  type: "bar" | "line"
  title: string
  description: string
  data: { label: string; value: number }[]
}

interface DecisionResponse {
  business_state: {
    summary: string
    growth_metrics: { monthly: string; yearly: string }
    confidence: string
  }
  trend_analysis: {
    revenue: string
    profit: string
    stability: string
  }
  root_causes: string[]
  impact: string
  forecast: {
    prediction: string
    expected_change: string
  }
  recommendations: string[]
  risks: string[]
  signals: any
  dataset_summary: {
    headline: string
    summary: string
    business_health: string
    query?: string
  }
  charts?: ChartItem[]
  // Keep some old fields for compatibility during transition if needed
  kpis?: {
    total_revenue: number
    total_orders: number
    avg_order_value: number
    margin_total: number
    rows_analyzed: number
  }
  raw_preview?: Record<string, string | number>[]
}

const defaultPrompt = "What should I do today?"

async function parseResponseData(response: Response) {
  const rawText = await response.clone().text().catch(() => "")
  try {
    return rawText ? JSON.parse(rawText) : null
  } catch (parseError) {
    return {
      detail: rawText || `Unable to parse server response (HTTP ${response.status})`,
    }
  }
}

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<View>("insights")
  const [isLoading, setIsLoading] = useState(false)
  const [uploadedData, setUploadedData] = useState<UploadedData | null>(null)
  const [decisionResponse, setDecisionResponse] = useState<DecisionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDataEvidence, setShowDataEvidence] = useState(true)
  const [manualRecords, setManualRecords] = useState<any[]>([])
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])

  const { user, isLoading: authLoading } = useAuth()
  const { language } = useLanguage()
  const previousLanguageRef = useRef(language)
  const router = useRouter()

  const copy = {
    en: {
      defaultPrompt,
      uploadFailed: "Upload failed.",
      generateFailed: "Could not generate decisions.",
      topRecommendationFallback: "Top recommendation: Review the highest-priority decision card.",
      titleFallback: "Upload data to see what the business should do next.",
      summaryFallback:
        "Visionix turns raw business data into practical decisions for owners who need guidance, not more dashboards.",
      firstRecommendationFallback: "Upload a CSV to generate your first recommendation.",
      connectionError: "Connection error. Please try again in a moment.",
      loadingTitle: "Visionix is thinking through your business.",
      loadingBody: "Finding problems, reasons, actions, and confidence scores...",
      topAction: "Today's top action",
      aiDecisionFeed: "AI Decision Feed",
      pageLabel: "Visionix Control Center",
      pageTitle: "AI Business Advisor",
      pageDescription: "Upload business data, review decisions, and act with confidence from one workspace.",
      pageStatus: "Live workspace",
    },
    hi: {
      defaultPrompt: "मुझे आज क्या करना चाहिए?",
      uploadFailed: "अपलोड विफल हुआ।",
      generateFailed: "निर्णय तैयार नहीं हो सके।",
      topRecommendationFallback: "मुख्य सिफारिश: सबसे उच्च-प्राथमिकता निर्णय कार्ड देखें।",
      titleFallback: "व्यवसाय को आगे क्या करना चाहिए, यह देखने के लिए डेटा अपलोड करें।",
      summaryFallback:
        "Visionix कच्चे व्यवसायिक डेटा को व्यावहारिक निर्णयों में बदलता है, ताकि मालिकों को मार्गदर्शन मिले, केवल डैशबोर्ड नहीं।",
      firstRecommendationFallback: "अपनी पहली सिफारिश के लिए CSV अपलोड करें।",
      connectionError: "कनेक्शन त्रुटि। कृपया थोड़ी देर में फिर प्रयास करें।",
      loadingTitle: "Visionix आपके व्यवसाय के बारे में सोच रहा है।",
      loadingBody: "समस्याएँ, कारण, कार्य और confidence scores ढूंढे जा रहे हैं...",
      topAction: "आज की सबसे महत्वपूर्ण कार्रवाई",
      aiDecisionFeed: "एआई निर्णय फ़ीड",
      pageLabel: "Visionix कंट्रोल सेंटर",
      pageTitle: "एआई व्यवसाय सलाहकार",
      pageDescription: "अपना व्यावसायिक डेटा अपलोड करें, निर्णय देखें और एक ही वर्कस्पेस से आत्मविश्वास के साथ कार्रवाई करें।",
      pageStatus: "लाइव वर्कस्पेस",
    },
    te: {
      defaultPrompt: "నేను ఈరోజు ఏమి చేయాలి?",
      uploadFailed: "అప్లోడ్ విఫలమైంది.",
      generateFailed: "నిర్ణయాలు రూపొందించలేకపోయాం.",
      topRecommendationFallback: "ముఖ్య సిఫారసు: అత్యంత ప్రాధాన్యమైన నిర్ణయ కార్డ్‌ను చూడండి.",
      titleFallback: "వ్యాపారం తర్వాత ఏమి చేయాలో చూడటానికి డేటాను అప్లోడ్ చేయండి.",
      summaryFallback:
        "Visionix ముడి వ్యాపార డేటాను ఆచరణాత్మక నిర్ణయాలుగా మార్చుతుంది, అందువల్ల యజమానులకు మరింత మార్గదర్శకం లభిస్తుంది.",
      firstRecommendationFallback: "మీ మొదటి సిఫారసును పొందడానికి CSV అప్లోడ్ చేయండి.",
      connectionError: "కనెక్షన్ లోపం. కొద్దిసేపటికి మళ్లీ ప్రయత్నించండి.",
      loadingTitle: "Visionix మీ వ్యాపారం గురించి ఆలోచిస్తోంది.",
      loadingBody: "సమస్యలు, కారణాలు, చర్యలు, నమ్మకం స్థాయిలను కనుగొంటోంది...",
      topAction: "ఈరోజు ముఖ్యమైన చర్య",
      aiDecisionFeed: "ఏఐ నిర్ణయ ఫీడ్",
      pageLabel: "Visionix కంట్రోల్ సెంటర్",
      pageTitle: "ఏఐ వ్యాపార సలహాదారు",
      pageDescription: "మీ వ్యాపార డేటాను అప్లోడ్ చేసి, నిర్ణయాలను చూసి, ఒకే వర్క్‌స్పేస్ నుంచి విశ్వాసంగా చర్య తీసుకోండి.",
      pageStatus: "లైవ్ వర్క్‌స్పేస్",
    },
  }[language]

  const handleExportPdf = async () => {
    if (!decisionResponse) return

    const { jsPDF } = await import("jspdf")
    const doc = new jsPDF({ unit: "pt", format: "a4" })
    const margin = 48
    const width = doc.internal.pageSize.getWidth() - margin * 2
    const pageHeight = doc.internal.pageSize.getHeight()
    let y = 56

    const writeBlock = (text: string, size = 12, weight: "normal" | "bold" = "normal") => {
      doc.setFont("helvetica", weight)
      doc.setFontSize(size)
      const lines = doc.splitTextToSize(text, width)
      const height = lines.length * 18 + 8
      if (y + height > pageHeight - 48) {
        doc.addPage()
        y = 56
      }
      doc.text(lines, margin, y)
      y += height
    }

    writeBlock("VISIONIX Business Summary", 22, "bold")
    if (decisionResponse?.dataset_summary) {
      writeBlock(decisionResponse.dataset_summary.headline, 16, "bold")
      writeBlock(decisionResponse.dataset_summary.summary)
    }
    writeBlock("Recommendations", 14, "bold")
    decisionResponse?.recommendations?.forEach((item, index) => writeBlock(`${index + 1}. ${item}`))
    
    writeBlock("Business Health", 14, "bold")
    writeBlock(decisionResponse.business_health)
    
    writeBlock("Trend Analysis", 14, "bold")
    writeBlock(decisionResponse.trend_analysis)
    
    writeBlock("Root Causes", 14, "bold")
    decisionResponse.root_causes.forEach((cause, index) => writeBlock(`${index + 1}. ${cause}`))
    
    writeBlock("Market Position", 14, "bold")
    writeBlock(decisionResponse.market_position)
    
    writeBlock("Forecast", 14, "bold")
    writeBlock(decisionResponse.forecast)
    
    writeBlock("Risks", 14, "bold")
    decisionResponse.risks.forEach((risk, index) => writeBlock(`${index + 1}. ${risk}`))

    doc.save(`visionix-summary-${language}.pdf`)
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [authLoading, router, user])

  useEffect(() => {
    const previousLanguage = previousLanguageRef.current
    if (
      previousLanguage !== language &&
      uploadedData &&
      decisionResponse?.dataset_summary?.query &&
      !isLoading
    ) {
      previousLanguageRef.current = language
      void generateDecisionFeed(decisionResponse.dataset_summary.query)
      return
    }
    previousLanguageRef.current = language
  }, [decisionResponse?.dataset_summary?.query, isLoading, language, uploadedData])

  const handleFileUpload = async (file: File): Promise<UploadedData | null> => {
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      const data = await parseResponseData(response)
      if (!response.ok || data?.detail) {
        throw new Error(data?.detail || copy.uploadFailed)
      }

      const uploaded = {
        columns: data.columns,
        rows: data.preview,
        fileName: file.name,
      }
      setUploadedData(uploaded)
      return uploaded
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : copy.uploadFailed)
      return null
    }
  }

  const generateDecisionFeed = async (query: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, history: chatMessages, language }),
      })
      const data = await parseResponseData(response)
      if (!response.ok || data?.detail) {
        throw new Error(data?.detail || copy.generateFailed)
      }
      setDecisionResponse(data)
      setActiveView("overview")
      setChatMessages([
        {
          role: "assistant",
          content: `${data?.dataset_summary?.headline || ""} ${data.recommendations?.[0] || copy.topRecommendationFallback}`,
        },
      ])
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : copy.generateFailed)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadAndAnalyze = async (file: File) => {
    const uploaded = await handleFileUpload(file)
    if (uploaded) {
      await generateDecisionFeed(copy.defaultPrompt)
    }
  }

  const handleDataExtracted = async (data: any[]) => {
    setManualRecords(prev => [...prev, ...data])
    // If no CSV uploaded, we can still generate decisions from manual records
    if (!uploadedData) {
        setUploadedData({
            columns: ["item", "quantity", "price"],
            rows: data,
            fileName: "Voice/OCR Data"
        })
    }
    await generateDecisionFeed(copy.defaultPrompt)
  }

  const handleChatSend = async (message: string) => {
    const nextMessages: ChatMessage[] = [...chatMessages, { role: "user", content: message }]
    setChatMessages(nextMessages)
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: nextMessages,
          context: decisionResponse,
          language,
        }),
      })
      const data = await parseResponseData(response)
      if (data?.detail) {
        throw new Error(data.detail)
      }
      const reply = data.reply || "I could not answer that yet."
      setChatMessages([...nextMessages, { role: "assistant", content: reply }])
    } catch {
      setChatMessages([
        ...nextMessages,
        { role: "assistant", content: copy.connectionError },
      ])
    }
  }

  const kpiCards = useMemo(() => {
    if (!decisionResponse || !decisionResponse.kpis) return []
    const labels = {
      en: ["Revenue", "Orders", "Avg order value", "Business health"],
      hi: ["राजस्व", "ऑर्डर्स", "औसत ऑर्डर मूल्य", "व्यवसाय की स्थिति"],
      te: ["ఆదాయం", "ఆర్డర్లు", "సగటు ఆర్డర్ విలువ", "వ్యాపార స్థితి"],
    }[language]

    const healthLabels: Record<string, Record<string, string>> = {
      en: {
        Stable: "Stable",
        Initializing: "Initializing",
        Volatile: "Volatile",
        Moderate: "Moderate",
        Error: "Error",
      },
      hi: {
        Stable: "स्थिर",
        Initializing: "प्रारंभ हो रहा है",
        Volatile: "अस्थिर",
        Moderate: "मध्यम",
        Error: "त्रुटि",
      },
      te: {
        Stable: "స్థిరంగా",
        Initializing: "ప్రారంభిస్తోంది",
        Volatile: "అస్తిరంగా",
        Moderate: "మధ్యమ",
        Error: "లోపం",
      },
    }

    const businessHealth = decisionResponse?.dataset_summary?.business_health || "Stable"
    const localizedHealth = healthLabels[language]?.[businessHealth] ?? businessHealth

    return [
      {
        label: labels[0],
        value: formatCurrency(decisionResponse.kpis.total_revenue, language),
        icon: TrendingUp,
      },
      {
        label: labels[1],
        value: formatNumber(decisionResponse.kpis.total_orders, language),
        icon: Target,
      },
      {
        label: labels[2],
        value: formatCurrency(decisionResponse.kpis.avg_order_value, language),
        icon: Sparkles,
      },
      {
        label: labels[3],
        value: localizedHealth,
        icon: ShieldAlert,
      },
    ]
  }, [decisionResponse, language])

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner className="h-10 w-10" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-[linear-gradient(180deg,rgba(247,251,255,1)_0%,rgba(232,242,255,1)_55%,rgba(211,230,255,1)_100%)] text-slate-950 dark:bg-[radial-gradient(circle_at_top,_rgba(18,96,255,0.16),_transparent_28%),linear-gradient(180deg,_#07111f_0%,_#060b14_100%)] dark:text-white">
      <Sidebar activeView={activeView} onViewChange={(view) => setActiveView(view as View)} />

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <motion.section
            initial={{ opacity: 0, y: 28, filter: "blur(18px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]"
          >
            <motion.div
              initial={{ opacity: 0, x: -26, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              whileHover={{ y: -10, scale: 1.012 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
            <Card className="glass-card motion-surface rounded-[30px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
              <CardContent className="p-7">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.26em] text-blue-700 dark:text-cyan-200">{copy.aiDecisionFeed}</p>
                    <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white flex items-center gap-3">
                      {decisionResponse?.dataset_summary?.headline || copy.titleFallback}
                      {user?.plan === "pro" && (
                        <Badge className="bg-[linear-gradient(135deg,#fcd34d_0%,#fbbf24_100%)] text-amber-950 border-none px-3 py-1 text-[10px] tracking-[0.2em] font-bold">
                          PRO
                        </Badge>
                      )}
                    </h1>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-slate-800 dark:text-slate-300">
                      {decisionResponse?.dataset_summary?.summary || copy.summaryFallback}
                    </p>
                  </div>

                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 5.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                    className="rounded-[26px] border border-blue-200 bg-blue-600/8 px-5 py-4 dark:border-cyan-300/20 dark:bg-cyan-400/10"
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-blue-700 dark:text-cyan-100">{copy.topAction}</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-900 dark:text-white">
                      {decisionResponse?.recommendations?.[0] || copy.firstRecommendationFallback}
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 26, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              whileHover={{ y: -10, scale: 1.012 }}
              transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
            <Card className="glass-card motion-surface rounded-[30px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {!uploadedData ? (
                    <InlineUploadSection onDataUploaded={handleUploadAndAnalyze} isLoading={isLoading} />
                  ) : (
                    <UploadedDataPreview
                      data={uploadedData}
                      onClear={() => {
                        setUploadedData(null)
                        setDecisionResponse(null)
                        setChatMessages([])
                        setError(null)
                        setManualRecords([])
                      }}
                    />
                  )}
                  <div className="border-t border-blue-200/50 pt-4 dark:border-white/10">
                    <p className="mb-3 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Add Data via Voice or Image</p>
                    <VoiceOCRSection onDataExtracted={handleDataExtracted} />
                  </div>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          </motion.section>


          {error && (
            <div className="mb-6 rounded-3xl border border-rose-300/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-700 dark:text-rose-100">
              {error}
            </div>
          )}

          {isLoading && (
            <Card className="glass-card mb-6 rounded-[30px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10">
                  <BrainCircuit className="h-8 w-8 animate-pulse text-cyan-200" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">{copy.loadingTitle}</p>
                  <p className="mt-2 text-sm text-slate-800 dark:text-slate-300">{copy.loadingBody}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <AnimatePresence mode="wait">
            {!isLoading && activeView === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <OverviewView
                  uploadedData={uploadedData}
                  decisionResponse={decisionResponse}
                  kpiCards={kpiCards}
                />
              </motion.div>
            )}

            {!isLoading && activeView === "insights" && (
              <motion.div
                key="insights"
                initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <InsightsView
                  decisionResponse={decisionResponse}
                  kpiCards={kpiCards}
                  showDataEvidence={showDataEvidence}
                  onToggleDataEvidence={() => setShowDataEvidence((value) => !value)}
                />
              </motion.div>
            )}

            {!isLoading && activeView === "chat" && (
              <motion.div
                key="chat"
                initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-6"
              >
                <InsightsPanel messages={chatMessages} onSend={handleChatSend} />
              </motion.div>
            )}

            {!isLoading && activeView === "reports" && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, y: 24, filter: "blur(14px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -16, filter: "blur(10px)" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <ReportsView decisionResponse={decisionResponse} onExport={handleExportPdf} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}

function OverviewView({
  uploadedData,
  decisionResponse,
  kpiCards,
}: {
  uploadedData: UploadedData | null
  decisionResponse: DecisionResponse | null
  kpiCards: { label: string; value: string; icon: React.ElementType }[]
}) {
  const { language } = useLanguage()
  const copy = {
    en: { brief: "Quick business brief", fileLoaded: "File loaded:", noFileUploaded: "No file uploaded", noDataSummary: "Upload a dataset to generate your business brief.", primaryFocus: "Primary focus:" },
    hi: { brief: "त्वरित व्यवसाय सारांश", fileLoaded: "लोड की गई फ़ाइल:", noFileUploaded: "कोई फ़ाइल अपलोड नहीं की गई", noDataSummary: "व्यवसाय सारांश बनाने के लिए एक डेटासेट अपलोड करें।", primaryFocus: "मुख्य फोकस:" },
    te: { brief: "త్వరిత వ్యాపార సారాంశం", fileLoaded: "లోడ్ చేసిన ఫైల్:", noFileUploaded: "ఏ ఫైలు అప్‌లోడ్ చేయబడలేదు", noDataSummary: "వ్యాపార సారాంశాన్ని ప్రసిద్ధి చేయడానికి ఒక డేటాసెట్‌ను అప్‌లోడ్ చేయండి.", primaryFocus: "ప్రధాన దృష్టి:" },
  }[language]
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <Card className="glass-card motion-surface rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-800 dark:text-slate-300">{card.label}</span>
                    <div className="rounded-2xl bg-cyan-500/10 p-2 text-cyan-600 dark:bg-cyan-400/10 dark:text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-bold text-slate-950 dark:text-white">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6">
        {decisionResponse && <BusinessIntelligenceReport report={decisionResponse} />}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {decisionResponse?.charts?.filter(c => c.data && c.data.length > 0).map((chart) => (
          <div key={chart.title}>
            {chart.type === "bar" ? (
              <DynamicBarChart data={chart.data} title={chart.title} subtitle={chart.description} />
            ) : (
              <DynamicLineChart data={chart.data} title={chart.title} subtitle={chart.description} />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6">
        <motion.div
          initial={{ opacity: 0, x: -22, scale: 0.985 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -8, scale: 1.01 }}
        >
        <Card className="glass-card motion-surface rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-950 dark:text-white">{copy.brief}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-7 text-slate-800 dark:text-slate-300">
            <p>{decisionResponse?.dataset_summary?.summary || copy.noDataSummary}</p>
            <p>
              {copy.fileLoaded} <span className="font-semibold text-slate-950 dark:text-white">{uploadedData?.fileName || copy.noFileUploaded}</span>
            </p>
          </CardContent>
        </Card>
        </motion.div>
      </div>
    </div>
  )
}

function InsightsView({
  decisionResponse,
  kpiCards,
  showDataEvidence,
  onToggleDataEvidence,
}: {
  decisionResponse: DecisionResponse | null
  kpiCards: { label: string; value: string; icon: React.ElementType }[]
  showDataEvidence: boolean
  onToggleDataEvidence: () => void
}) {
  const { language } = useLanguage()
  const copy = {
    en: { emptyTitle: "Decision feed is waiting for data", emptyCopy: "Upload a CSV and Visionix will turn it into decision cards with reasoning and actions.", viewData: "View Data", hideData: "Hide Data", dataCopy: "Charts and raw rows are hidden until needed." },
    hi: { emptyTitle: "निर्णय फ़ीड डेटा की प्रतीक्षा कर रही है", emptyCopy: "CSV अपलोड करें और Visionix उसे कारणों और कार्यों वाले निर्णय कार्ड्स में बदल देगा।", viewData: "डेटा देखें", hideData: "डेटा छिपाएँ", dataCopy: "चार्ट्स और कच्ची पंक्तियाँ आवश्यकता होने तक छिपी रहती हैं।" },
    te: { emptyTitle: "నిర్ణయ ఫీడ్ డేటాను ఎదురుచూస్తోంది", emptyCopy: "CSV అప్లోడ్ చేయండి, Visionix దాన్ని కారణాలు మరియు చర్యలతో కూడిన నిర్ణయ కార్డులుగా మారుస్తుంది.", viewData: "డేటా చూడండి", hideData: "డేటా దాచండి", dataCopy: "చార్ట్స్ మరియు అసలు వరుసలు అవసరం అయ్యే వరకు దాచబడతాయి." },
  }[language]
  if (!decisionResponse) {
    return (
      <EmptyExperience
        title={copy.emptyTitle}
        copy={copy.emptyCopy}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card, index) => {
          const Icon = card.icon
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
            >
              <Card className="glass-card motion-surface rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{card.label}</span>
                    <div className="rounded-2xl bg-cyan-400/10 p-2 text-cyan-200">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{card.value}</p>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      <div className="grid gap-6">
        {decisionResponse && <BusinessIntelligenceReport report={decisionResponse} />}
      </div>

      {showDataEvidence && decisionResponse && (
        <SupportingEvidence decisionResponse={decisionResponse} />
      )}
    </div>
  )
}

function ReportsView({
  decisionResponse,
  onExport,
}: {
  decisionResponse: DecisionResponse | null
  onExport: () => void
}) {
  const { language } = useLanguage()
  const copy = {
    en: {
      noReport: "No report yet",
      noReportCopy: "Generate a decision feed first. Then this page can be used to export owner-friendly summaries.",
      downloadReady: "Download-ready summary",
      latestRecap: "Latest decision recap",
      export: "Export PDF Summary",
      included: "Included in report",
      executiveSummary: "Executive summary",
      risks: "Top risks and opportunities",
      weeklyActions: "Recommended actions for this week",
      snapshots: "Supporting data snapshots",
      action: "Action",
    },
    hi: {
      noReport: "अभी कोई रिपोर्ट नहीं",
      noReportCopy: "पहले निर्णय फ़ीड बनाइए। फिर इस पेज का उपयोग मालिकों के लिए उपयुक्त सारांश निर्यात करने में किया जा सकता है।",
      downloadReady: "डाउनलोड के लिए तैयार सारांश",
      latestRecap: "नवीनतम निर्णय सारांश",
      export: "PDF सारांश निर्यात करें",
      included: "रिपोर्ट में शामिल",
      executiveSummary: "कार्यकारी सारांश",
      risks: "मुख्य जोखिम और अवसर",
      weeklyActions: "इस सप्ताह के लिए सुझाए गए कदम",
      snapshots: "समर्थन करने वाले डेटा स्नैपशॉट",
      action: "कार्य",
    },
    te: {
      noReport: "ఇంకా రిపోర్ట్ లేదు",
      noReportCopy: "ముందుగా నిర్ణయ ఫీడ్ రూపొందించండి. తర్వాత ఈ పేజీని యజమానులకు అనువైన సారాంశాలను ఎగుమతి చేయడానికి ఉపయోగించవచ్చు.",
      downloadReady: "డౌన్‌లోడ్‌కు సిద్ధమైన సారాంశం",
      latestRecap: "తాజా నిర్ణయ సారాంశం",
      export: "PDF సారాంశాన్ని ఎగుమతి చేయండి",
      included: "రిపోర్టులో చేర్చబడినవి",
      executiveSummary: "ఎగ్జిక్యూటివ్ సారాంశం",
      risks: "ప్రధాన ప్రమాదాలు మరియు అవకాశాలు",
      weeklyActions: "ఈ వారానికి సూచించిన చర్యలు",
      snapshots: "సహాయక డేటా స్నాప్‌షాట్‌లు",
      action: "చర్య",
    },
  }[language]
  if (!decisionResponse) {
    return (
      <EmptyExperience
        title={copy.noReport}
        copy={copy.noReportCopy}
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <motion.div
        initial={{ opacity: 0, x: -22, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
      <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
        <CardHeader>
          <CardTitle className="text-slate-950 dark:text-white">{copy.downloadReady}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-7 text-slate-800 dark:text-slate-300">
          <p>{decisionResponse?.dataset_summary?.summary || ""}</p>
          <div className="rounded-3xl border border-blue-100 bg-white/70 p-4 dark:border-white/10 dark:bg-slate-950/45">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:text-slate-400">{copy.included}</p>
            <div className="mt-3 space-y-2">
              <p>1. {copy.executiveSummary}</p>
              <p>2. {copy.risks}</p>
              <p>3. {copy.weeklyActions}</p>
              <p>4. {copy.snapshots}</p>
            </div>
          </div>
          <Button
            onClick={onExport}
            className="rounded-2xl bg-[linear-gradient(135deg,#56c7ff_0%,#2253ff_100%)] text-white shadow-[0_16px_40px_rgba(34,83,255,0.28)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(34,83,255,0.35)]"
          >
            <FileDown className="mr-2 h-4 w-4" />
            {copy.export}
          </Button>
        </CardContent>
      </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 22, scale: 0.98 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
      <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
        <CardHeader>
          <CardTitle className="text-slate-950 dark:text-white">{copy.latestRecap}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {decisionResponse?.recommendations?.map((rec, index) => (
            <div key={index} className="rounded-3xl border border-blue-100 bg-white/70 p-4 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(80,120,255,0.12)] dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-base font-semibold text-slate-950 dark:text-white">{rec}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      </motion.div>
    </div>
  )
}

function SupportingEvidence({ decisionResponse }: { decisionResponse: DecisionResponse }) {
  const { language } = useLanguage()
  const title = {
    en: "Data preview",
    hi: "डेटा पूर्वावलोकन",
    te: "డేటా ప్రివ్యూ",
  }[language]
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-2">
        {decisionResponse?.charts?.map((chart) => (
          <div key={chart.title}>
            {chart.type === "bar" ? (
              <DynamicBarChart data={chart.data} title={chart.title} subtitle={chart.description} />
            ) : (
              <DynamicLineChart data={chart.data} title={chart.title} subtitle={chart.description} />
            )}
          </div>
        ))}
      </div>

      <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-950 dark:text-white">
            <FileSpreadsheet className="h-5 w-5 text-cyan-200" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white/70 dark:border-white/10 dark:bg-slate-950/45">
            <Table>
              <TableHeader>
                <TableRow className="border-blue-100 hover:bg-transparent dark:border-white/10">
                  {Object.keys(decisionResponse?.raw_preview?.[0] || {}).map((column) => (
                    <TableHead key={column} className="text-slate-600 dark:text-slate-300">
                      {column}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {decisionResponse?.raw_preview?.map((row, index) => (
                  <TableRow key={index} className="border-blue-100 hover:bg-blue-50/60 dark:border-white/10 dark:hover:bg-white/5">
                    {Object.entries(row).map(([key, value]) => (
                      <TableCell key={key} className="text-slate-800 dark:text-slate-200">
                        {String(value)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}



function BusinessIntelligenceReport({ report }: { report: DecisionResponse }) {
  const { language } = useLanguage()
  const copy = {
    en: {
      state: "Business Health & State",
      trends: "Revenue & Profit Trends",
      causes: "Root Cause Diagnosis",
      impact: "Financial & Operational Impact",
      forecast: "ML Predictive Forecast",
      rec: "Strategic Recommendations",
      risks: "Identified Risks",
      confidence: "Analysis Confidence:",
      monthly: "Monthly Growth",
      yearly: "Yearly Growth",
      revenue: "Revenue",
      profit: "Profit",
      predictedRevenue: "Predicted Revenue",
      expectedChange: "Expected Change",
    },
    hi: {
      state: "व्यवसाय स्वास्थ्य और स्थिति",
      trends: "राजस्व और लाभ रुझान",
      causes: "मूल कारण निदान",
      impact: "वित्तीय और परिचालन प्रभाव",
      forecast: "एमएल भविष्य कहनेवाला पूर्वानुमान",
      rec: "रणनीतिक सिफारिशें",
      risks: "पहचाने गए जोखिम",
      confidence: "विश्लेषण आत्मविश्वास:",
      monthly: "मासिक वृद्धि",
      yearly: "वार्षिक वृद्धि",
      revenue: "राजस्व",
      profit: "लाभ",
      predictedRevenue: "पूर्वानुमानित राजस्व",
      expectedChange: "अपेक्षित परिवर्तन",
    },
    te: {
      state: "వ్యాపార ఆరోగ్యం & స్థితి",
      trends: "ఆదాయం & లాభ ధోరణులు",
      causes: "మూల కారణ నిర్ధారణ",
      impact: "ఆర్థిక & కార్యాచరణ ప్రభావం",
      forecast: "ML ప్రిడిక్టివ్ సూచన",
      rec: "వ్యూహాత్మక సిఫార్సులు",
      risks: "గుర్తించిన ప్రమాదాలు",
      confidence: "విశ్లేషణ నమ్మకం:",
      monthly: "మాసిక వృద్ధి",
      yearly: "వార్షిక వృద్ధి",
      revenue: "ఆదాయం",
      profit: "లాభం",
      predictedRevenue: "అంచనా ఆదాయం",
      expectedChange: "అంచనా మార్పు",
    },
  }[language]

  const confidenceColor = 
    report.business_state.confidence === "High" ? "text-emerald-400" :
    report.business_state.confidence === "Medium" ? "text-amber-400" : "text-rose-400";

  return (
    <div className="space-y-6">
      {/* Header Metric Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card rounded-[24px] border border-blue-200/50 bg-white/70 p-5 dark:border-white/10 dark:bg-white/6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{copy.monthly}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{report.business_state.growth_metrics.monthly}</p>
        </Card>
        <Card className="glass-card rounded-[24px] border border-blue-200/50 bg-white/70 p-5 dark:border-white/10 dark:bg-white/6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{copy.yearly}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{report.business_state.growth_metrics.yearly}</p>
        </Card>
        <Card className="glass-card rounded-[24px] border border-blue-200/50 bg-white/70 p-5 dark:border-white/10 dark:bg-white/6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{copy.confidence}</p>
          <p className={`mt-2 text-3xl font-bold ${confidenceColor}`}>{report.business_state.confidence}</p>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Business State */}
        <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              {copy.state}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-7 text-slate-800 dark:text-slate-300">{report.business_state.summary}</p>
          </CardContent>
        </Card>

        {/* Trend Analysis */}
        <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              {copy.trends}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{copy.revenue}</p>
              <p className="text-sm text-slate-800 dark:text-slate-300">{report.trend_analysis.revenue}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{copy.profit}</p>
              <p className="text-sm text-slate-800 dark:text-slate-300">{report.trend_analysis.profit}</p>
            </div>
          </CardContent>
        </Card>

        {/* Root Causes */}
        <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400">
                <BrainCircuit className="h-5 w-5" />
              </div>
              {copy.causes}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {report.root_causes.map((cause, i) => (
                <li key={i} className="flex gap-3 text-sm leading-6 text-slate-800 dark:text-slate-300">
                  <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-400" />
                  {cause}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Forecast */}
        <Card className="glass-card rounded-[28px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base font-semibold">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                <Sparkles className="h-5 w-5" />
              </div>
              {copy.forecast}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{copy.predictedRevenue}</p>
                <p className="text-2xl font-bold text-slate-950 dark:text-white">{report.forecast.prediction}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{copy.expectedChange}</p>
                <p className="text-lg font-semibold text-emerald-400">{report.forecast.expected_change}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Impact & Action */}
        <div className="md:col-span-2 grid gap-6 md:grid-cols-2">
            <Card className="glass-card rounded-[28px] border border-amber-200/50 bg-amber-500/5 dark:border-amber-300/10 dark:bg-amber-400/5">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base font-semibold text-amber-900 dark:text-amber-200">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10">
                            <Target className="h-5 w-5" />
                        </div>
                        {copy.impact}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm leading-7 text-amber-950/80 dark:text-amber-100/70">{report.impact}</p>
                </CardContent>
            </Card>

            <Card className="glass-card rounded-[28px] border border-blue-300/30 bg-blue-500/5 dark:border-cyan-300/20 dark:bg-cyan-400/5">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 text-base font-semibold text-blue-950 dark:text-cyan-100">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/10 dark:bg-cyan-400/10">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        {copy.rec}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                    {report.recommendations.map((rec, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-6 text-blue-900 dark:text-cyan-50/80 font-medium">
                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-blue-500 dark:text-cyan-400" />
                        {rec}
                        </li>
                    ))}
                    </ul>
                </CardContent>
            </Card>
        </div>

        {/* Risks */}
        <Card className="md:col-span-2 glass-card rounded-[28px] border border-rose-200/50 bg-rose-500/5 dark:border-rose-300/10 dark:bg-rose-400/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-3 text-base font-semibold text-rose-900 dark:text-rose-200">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-500/10">
                <AlertTriangle className="h-5 w-5" />
              </div>
              {copy.risks}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2">
              {report.risks.map((risk, i) => (
                <li key={i} className="flex gap-3 text-sm leading-6 text-rose-950/80 dark:text-rose-100/70">
                  <div className="mt-2 h-1 w-3 shrink-0 rounded-full bg-rose-400" />
                  {risk}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EmptyExperience({ title, copy }: { title: string; copy: string }) {
  return (
    <Card className="glass-card rounded-[30px] border border-blue-200/50 bg-white/70 dark:border-white/10 dark:bg-white/6">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200">
          <BrainCircuit className="h-8 w-8" />
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-950 dark:text-white">{title}</p>
          <p className="mt-2 max-w-xl text-sm leading-7 text-slate-700 dark:text-slate-300">{copy}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InlineUploadSection({
  onDataUploaded,
  isLoading,
}: {
  onDataUploaded: (file: File) => void
  isLoading: boolean
}) {
  const { language } = useLanguage()
  const copy = {
    en: { title: "Upload your CSV to generate decisions", body: "Visionix will analyze your file and produce recommendations, risk alerts, and actions automatically." },
    hi: { title: "निर्णय उत्पन्न करने के लिए अपनी CSV अपलोड करें", body: "Visionix आपकी फ़ाइल का विश्लेषण करेगा और स्वचालित रूप से सिफारिशें, जोखिम अलर्ट और कार्य देगा।" },
    te: { title: "నిర్ణయాలను రూపొందించేందుకు మీ CSV ని అప్లోడ్ చేయండి", body: "Visionix మీ ఫైల్‌ను విశ్లేషించి సిఫారసులు, ప్రమాద హెచ్చరికలు మరియు చర్యలను స్వయంచాలకంగా ఇస్తుంది." },
  }[language]
  const [isDragOver, setIsDragOver] = useState(false)

  const handleFileSelect = (file?: File) => {
    if (!file) return
    if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
      onDataUploaded(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0.85, scale: 0.985 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      whileHover={{ scale: 1.015, y: -10 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      onDrop={(event) => {
        event.preventDefault()
        setIsDragOver(false)
        handleFileSelect(event.dataTransfer.files?.[0])
      }}
      onDragOver={(event) => {
        event.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onClick={() => {
        if (isLoading) return
        const input = document.createElement("input")
        input.type = "file"
        input.accept = ".csv"
        input.onchange = (event) => handleFileSelect((event.target as HTMLInputElement).files?.[0])
        input.click()
      }}
      className={`motion-surface cursor-pointer rounded-[28px] border-2 border-dashed p-8 transition ${
        isDragOver ? "border-cyan-300 bg-cyan-400/10 shadow-[0_0_0_1px_rgba(103,232,249,0.25),0_26px_70px_rgba(34,211,238,0.16)]" : "border-blue-200 bg-white/75 dark:border-white/10 dark:bg-slate-950/35"
      } ${isLoading ? "pointer-events-none opacity-70" : ""}`}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div
          animate={{ y: [0, -7, 0], scale: [1, 1.04, 1] }}
          transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-200"
        >
          <Upload className="h-8 w-8" />
        </motion.div>
        <p className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">{copy.title}</p>
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-700 dark:text-slate-300">
          {copy.body}
        </p>
      </div>
    </motion.div>
  )
}

function UploadedDataPreview({ data, onClear }: { data: UploadedData; onClear: () => void }) {
  const { language } = useLanguage()
  const copy = {
    en: "columns detected",
    hi: "कॉलम पाए गए",
    te: "కాలమ్లు కనుగొనబడ్డాయి",
  }[language]
  return (
    <motion.div
      initial={{ opacity: 0.88, scale: 0.985 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-200">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold text-slate-950 dark:text-white">{data.fileName}</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">{data.columns.length} {copy}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClear} className="text-slate-600 hover:bg-blue-50 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {data.columns.map((column) => (
          <span key={column} className="rounded-full border border-blue-100 bg-white/80 px-3 py-1 text-xs text-slate-700 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(85,130,255,0.18)] dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
            {column}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

function formatCurrency(value: number, language: string) {
  const locale = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN"
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

function formatNumber(value: number, language: string) {
  const locale = language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-IN"
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
}
