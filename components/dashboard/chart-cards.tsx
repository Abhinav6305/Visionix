"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useLanguage } from "@/lib/language-context"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts"

// Dynamic chart data interfaces
export interface ChartDataPoint {
  label: string
  value: number
}

export interface ScatterPoint {
  x: number
  y: number
}

interface DynamicChartProps {
  data: ChartDataPoint[]
  title?: string
  subtitle?: string
  animationDelay?: number
}

// Dynamic chart component for API responses
export function DynamicBarChart({ data, title, subtitle, animationDelay = 0 }: DynamicChartProps) {
  const { language } = useLanguage()
  const defaultTitle = {
    en: "Analysis Results",
    hi: "विश्लेषण परिणाम",
    te: "విశ్లేషణ ఫలితాలు",
  }[language]

  const chartConfig = {
    value: {
      label: "Value",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card 
      className="border-border bg-card transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelay}ms`, animationDuration: "600ms" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title || defaultTitle}
        </CardTitle>
        {subtitle && <p className="text-2xl font-semibold text-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="value"
              fill="var(--chart-1)"
              radius={[6, 6, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DynamicLineChart({ data, title, subtitle, animationDelay = 0 }: DynamicChartProps) {
  const { language } = useLanguage()
  const defaultTitle = {
    en: "Trend Analysis",
    hi: "रुझान विश्लेषण",
    te: "ధోరణి విశ్లేషణ",
  }[language]

  const chartConfig = {
    value: {
      label: "Value",
      color: "var(--chart-1)",
    },
  } satisfies ChartConfig

  return (
    <Card 
      className="border-border bg-card transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelay}ms`, animationDuration: "600ms" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title || defaultTitle}
        </CardTitle>
        {subtitle && <p className="text-2xl font-semibold text-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 6, fill: "var(--chart-1)" }}
              animationDuration={1500}
              animationEasing="ease-out"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DynamicPieChart({ data, title, subtitle, animationDelay = 0 }: DynamicChartProps) {
  const { language } = useLanguage()
  const defaultTitle = {
    en: "Distribution",
    hi: "वितरण",
    te: "విభజనం",
  }[language]

  const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
  
  const chartConfig = data.reduce((acc, item, index) => {
    acc[item.label] = {
      label: item.label,
      color: colors[index % colors.length],
    }
    return acc
  }, { value: { label: "Value" } } as ChartConfig)

  const pieDataWithColors = data.map((item, index) => ({
    ...item,
    name: item.label,
    fill: colors[index % colors.length],
  }))

  return (
    <Card 
      className="border-border bg-card transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelay}ms`, animationDuration: "600ms" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title || defaultTitle}
        </CardTitle>
        {subtitle && <p className="text-2xl font-semibold text-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={pieDataWithColors}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {pieDataWithColors.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {pieDataWithColors.map((entry, index) => (
            <div key={index} className="flex items-center gap-1.5 transition-all duration-300 hover:scale-105">
              <div
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-xs text-muted-foreground">
                {entry.name} ({entry.value})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface DynamicScatterProps {
  data: { xLabel: string; yLabel: string; points: ScatterPoint[] }
  title?: string
  subtitle?: string
  animationDelay?: number
}

export function DynamicScatterChart({ data, title, subtitle, animationDelay = 0 }: DynamicScatterProps) {
  const { language } = useLanguage()
  const defaultTitle = {
    en: "Correlation / Scatter",
    hi: "संबंध / स्कैटर",
    te: "సంబంధం / స్కాటర్",
  }[language]

  const chartConfig = {
    points: {
      label: "Points",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  return (
    <Card
      className="border-border bg-card transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelay}ms`, animationDuration: "600ms" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title || defaultTitle}
        </CardTitle>
        {subtitle && <p className="text-2xl font-semibold text-foreground">{subtitle}</p>}
        <p className="text-xs text-muted-foreground">{data.xLabel} vs {data.yLabel}</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[240px] w-full">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="x"
              name={data.xLabel}
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              name={data.yLabel}
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <ZAxis type="number" range={[60, 60]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Scatter
              data={data.points}
              fill="var(--chart-2)"
              animationDuration={900}
              animationEasing="ease-out"
            />
          </ScatterChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface DynamicHeatmapProps {
  data: {
    rowLabel: string
    colLabel: string
    xLabels: string[]
    yLabels: string[]
    matrix: number[][]
    valueLabel?: string
  }
  title?: string
  animationDelay?: number
}

function heatColor(value: number, min: number, max: number) {
  if (max <= min) return "rgba(59,130,246,0.25)" // fallback
  const t = (value - min) / (max - min)
  const a = 0.12 + t * 0.88
  return `rgba(59,130,246,${a.toFixed(3)})`
}

export function DynamicHeatmap({ data, title, animationDelay = 0 }: DynamicHeatmapProps) {
  const { language } = useLanguage()
  const defaultTitle = {
    en: "Heatmap",
    hi: "हीटमैप",
    te: "హీట్‌మ్యాప్",
  }[language]

  const flat = data.matrix.flat()
  const min = Math.min(...flat)
  const max = Math.max(...flat)

  return (
    <Card
      className="border-border bg-card transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 animate-in fade-in slide-in-from-bottom-4"
      style={{ animationDelay: `${animationDelay}ms`, animationDuration: "650ms" }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title || defaultTitle}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          {data.rowLabel} × {data.colLabel}{data.valueLabel ? ` (Σ ${data.valueLabel})` : ""}
        </p>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-auto">
          <div
            className="grid gap-1"
            style={{
              gridTemplateColumns: `160px repeat(${data.xLabels.length}, minmax(42px, 1fr))`,
              minWidth: 160 + data.xLabels.length * 52,
            }}
          >
            <div />
            {data.xLabels.map((x) => (
              <div key={x} className="text-[11px] text-muted-foreground px-1 py-1 truncate">
                {x}
              </div>
            ))}

            {data.yLabels.map((y, rowIdx) => (
              <div key={y} className="contents">
                <div className="text-[11px] text-muted-foreground px-1 py-1 truncate">
                  {y}
                </div>
                {data.matrix[rowIdx].map((v, colIdx) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="h-10 rounded-md border border-border/60 flex items-center justify-center text-[11px] font-medium text-foreground/90 transition-transform duration-200 hover:scale-[1.03]"
                    style={{ backgroundColor: heatColor(v, min, max) }}
                    title={`${y} × ${data.xLabels[colIdx]}: ${v.toLocaleString()}`}
                  >
                    {Number.isFinite(v) ? (v >= 1000 ? Math.round(v).toLocaleString() : v.toFixed(0)) : "-"}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
