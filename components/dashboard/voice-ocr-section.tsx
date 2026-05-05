"use client"

import { useState, useRef } from "react"
import { Mic, Image as ImageIcon, Loader2, Check, X, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

interface VoiceOCRSectionProps {
  onDataExtracted: (data: any[]) => void
}

export function VoiceOCRSection({ onDataExtracted }: VoiceOCRSectionProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [mode, setMode] = useState<"idle" | "voice" | "ocr">("idle")
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  // Real Voice Recording Logic using MediaRecorder API
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })
        await uploadVoice(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setIsRecording(true)
      setMode("voice")
    } catch (err) {
      console.error("Failed to start recording", err)
      toast.error("Microphone access denied or not available")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const uploadVoice = async (blob: Blob) => {
    setIsProcessing(true)
    try {
      const formData = new FormData()
      formData.append("file", blob, "audio.webm")

      const response = await fetch("/api/voice-input", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.clone().text().catch(() => "")
        throw new Error(errorText || "Voice processing failed")
      }
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        const errorText = await response.clone().text().catch(() => "")
        throw new Error(errorText || "Invalid JSON response from voice service")
      }

      toast.success(`Transcribed: "${result.text}"`)
      onDataExtracted(result.data)
    } catch (error) {
      console.error(error)
      toast.error("Could not process voice input")
    } finally {
      setIsProcessing(false)
      setMode("idle")
    }
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsProcessing(true)
    setMode("ocr")
    
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/ocr-input", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorText = await response.clone().text().catch(() => "")
        throw new Error(errorText || "Image processing failed")
      }
      
      let result
      try {
        result = await response.json()
      } catch (parseError) {
        const errorText = await response.clone().text().catch(() => "")
        throw new Error(errorText || "Invalid JSON response from image service")
      }

      toast.success("Sales record parsed successfully")
      onDataExtracted(result.data)
    } catch (error) {
      console.error(error)
      toast.error("Could not process image")
    } finally {
      setIsProcessing(false)
      setMode("idle")
    }
  }

  return (
    <div className="flex gap-4">
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? "destructive" : "outline"}
          className={`h-14 w-14 rounded-2xl ${isRecording ? "animate-pulse" : "bg-white/10 dark:bg-white/5 border-blue-200/50 dark:border-white/10"}`}
          disabled={isProcessing && mode !== "voice"}
        >
          {isProcessing && mode === "voice" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Mic className={`h-6 w-6 ${isRecording ? "text-white" : "text-blue-600 dark:text-cyan-400"}`} />
          )}
        </Button>
      </motion.div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          className="h-14 w-14 rounded-2xl bg-white/10 dark:bg-white/5 border-blue-200/50 dark:border-white/10"
          disabled={isProcessing}
        >
          {isProcessing && mode === "ocr" ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <Camera className="h-6 w-6 text-blue-600 dark:text-cyan-400" />
          )}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </motion.div>

      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex items-center gap-3 rounded-2xl bg-blue-600/10 px-4 py-2 dark:bg-cyan-400/10"
          >
            <div className="h-2 w-2 animate-ping rounded-full bg-red-500" />
            <span className="text-sm font-medium text-blue-700 dark:text-cyan-200">
              Recording...
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
