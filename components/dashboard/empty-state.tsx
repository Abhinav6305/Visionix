"use client"

import { MessageSquare, Sparkles } from "lucide-react"

interface EmptyStateProps {
  onUploadClick?: () => void
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="relative">
        <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 transition-all duration-500 hover:scale-105 hover:bg-primary/15">
          <MessageSquare className="h-12 w-12 text-primary transition-transform duration-500" />
        </div>
        {/* Floating sparkle decoration */}
        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 animate-bounce" style={{ animationDuration: "2s" }}>
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
      </div>
      <h3 className="mt-8 text-2xl font-semibold text-foreground transition-colors duration-300">
        Ready to explore your data
      </h3>
      <p className="mt-3 max-w-md text-muted-foreground transition-colors duration-300 leading-relaxed">
        Upload a dataset above and ask questions in natural language to generate beautiful visualizations and insights
      </p>
    </div>
  )
}
