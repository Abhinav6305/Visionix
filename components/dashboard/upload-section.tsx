"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Upload, FileSpreadsheet, Check, X, CloudUpload } from "lucide-react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"

interface UploadedData {
  columns: string[]
  rows: Record<string, string>[]
  fileName: string
}

interface UploadSectionProps {
  onDataUploaded: (data: UploadedData | null) => void
  uploadedData: UploadedData | null
}

export function UploadSection({ onDataUploaded, uploadedData }: UploadSectionProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    if (file && (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv"))) {
      setIsUploading(true)
      
      // Simulate upload delay for animation
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const lines = text.split("\n").filter((line) => line.trim())
        const columns = lines[0].split(",").map((col) => col.trim())
        const rows = lines.slice(1, 6).map((line) => {
          const values = line.split(",")
          return columns.reduce((acc, col, i) => {
            acc[col] = values[i]?.trim() || ""
            return acc
          }, {} as Record<string, string>)
        })
        onDataUploaded({ columns, rows, fileName: file.name })
        setIsUploading(false)
      }
      reader.readAsText(file)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    handleFileSelect(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const clearData = () => {
    onDataUploaded(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card transition-all duration-500 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold transition-colors duration-300">Upload Dataset</CardTitle>
        </CardHeader>
        <CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleInputChange}
            className="hidden"
          />
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`
              relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 
              transition-all duration-500 ease-out
              ${isDragOver
                ? "border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/10"
                : "border-border hover:border-primary/50 hover:bg-secondary/30 hover:shadow-md"
              }
              ${isUploading ? "pointer-events-none" : ""}
            `}
          >
            <div className={`
              flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 
              transition-all duration-500
              ${isDragOver ? "scale-110 bg-primary/20" : ""}
              ${isUploading ? "animate-pulse" : ""}
            `}>
              {isUploading ? (
                <CloudUpload className="h-8 w-8 text-primary animate-bounce" />
              ) : (
                <Upload className={`h-8 w-8 text-primary transition-transform duration-500 ${isDragOver ? "scale-110" : ""}`} />
              )}
            </div>
            <p className="mt-5 text-base font-medium text-foreground transition-colors duration-300">
              {isUploading ? "Uploading..." : "Drop your CSV file here or click to browse"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground transition-colors duration-300">
              Supported format: CSV
            </p>
            
            {/* Animated border effect on drag */}
            {isDragOver && (
              <div className="absolute inset-0 rounded-2xl border-2 border-primary animate-pulse pointer-events-none" />
            )}
          </div>
        </CardContent>
      </Card>

      {uploadedData && (
        <Card className="border-border bg-card transition-all duration-500 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4">
          <CardHeader className="flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 transition-all duration-300 hover:scale-105">
                <FileSpreadsheet className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-base font-medium transition-colors duration-300">
                  {uploadedData.fileName}
                </CardTitle>
                <p className="text-sm text-muted-foreground transition-colors duration-300">
                  {uploadedData.columns.length} columns detected
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearData}
              className="transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="mb-3 text-sm font-medium text-muted-foreground transition-colors duration-300">
                Detected Columns:
              </p>
              <div className="flex flex-wrap gap-2">
                {uploadedData.columns.map((col, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-all duration-300 hover:bg-primary/20 hover:scale-105 animate-in fade-in"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <Check className="h-3 w-3" />
                    {col}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50 transition-colors duration-300">
                    {uploadedData.columns.map((col, i) => (
                      <TableHead key={i} className="text-xs font-semibold text-foreground transition-colors duration-300">
                        {col}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uploadedData.rows.map((row, i) => (
                    <TableRow 
                      key={i} 
                      className="transition-colors duration-300 hover:bg-secondary/30 animate-in fade-in"
                      style={{ animationDelay: `${i * 75}ms` }}
                    >
                      {uploadedData.columns.map((col, j) => (
                        <TableCell key={j} className="text-sm text-muted-foreground transition-colors duration-300">
                          {row[col]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="mt-3 text-xs text-muted-foreground transition-colors duration-300">
              Showing first 5 rows
            </p>
          </CardContent>
        </Card>
      )}

      {!uploadedData && (
        <Card className="border-border bg-card transition-all duration-500 hover:shadow-lg">
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No data uploaded</EmptyTitle>
                <EmptyDescription>Upload a CSV file to start analyzing your data with AI</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
