"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, ArrowRight, History } from "lucide-react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

interface QueryHistoryItem {
  query: string
  timestamp: string
}

interface QueryHistoryProps {
  history: QueryHistoryItem[]
  onSelectQuery: (query: string) => void
}

export function QueryHistory({ history, onSelectQuery }: QueryHistoryProps) {
  if (history.length === 0) {
    return (
      <Card className="border-border bg-card transition-all duration-500 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <History className="h-5 w-5 text-primary" />
            Query History
          </CardTitle>
        </CardHeader>
        <CardContent className="py-12">
          <Empty>
            <EmptyHeader>
              <EmptyTitle>No queries yet</EmptyTitle>
              <EmptyDescription>Your query history will appear here after you generate your first dashboard</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card transition-all duration-500 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold transition-colors duration-300">
          <History className="h-5 w-5 text-primary" />
          Query History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {history.map((item, index) => (
            <li 
              key={index}
              className="animate-in fade-in slide-in-from-left-4"
              style={{ animationDelay: `${index * 75}ms`, animationDuration: "400ms" }}
            >
              <button
                onClick={() => onSelectQuery(item.query)}
                className="group flex w-full items-center justify-between rounded-xl border border-border bg-secondary/30 p-4 text-left transition-all duration-400 hover:border-primary/50 hover:bg-primary/5 hover:shadow-md hover:-translate-x-1"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-all duration-300 group-hover:bg-primary/10 group-hover:scale-105">
                    <Clock className="h-4 w-4 text-muted-foreground transition-colors duration-300 group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground transition-colors duration-300">{item.query}</p>
                    <p className="mt-1 text-xs text-muted-foreground transition-colors duration-300">
                      {item.timestamp}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
