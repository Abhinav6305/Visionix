"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      if (!user.isSetupComplete) {
        router.push("/setup")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, isLoading, router])

  return <>{children}</>
}
