"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  plan?: "free" | "pro"
  avatar?: string
  companyName?: string
  smbType?: "small" | "medium"
  businessType?: string
  isSetupComplete?: boolean
  isAdmin?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: (profile: { name: string; email: string; picture?: string }) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  updateUser: (data: Partial<User>) => void
  deleteCurrentUser: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const PREMIUM_EMAIL = "abhinavrishisaka@gmail.com"

function resolvePlan(email?: string, plan?: "free" | "pro") {
  if (email?.toLowerCase() === PREMIUM_EMAIL) {
    return "pro" as const
  }
  return plan || "free"
}

function resolveAdmin(email?: string) {
  return email?.toLowerCase() === PREMIUM_EMAIL
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("visionix_user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      const hydratedUser = {
        ...parsedUser,
        plan: resolvePlan(parsedUser.email, parsedUser.plan),
      }
      setUser(hydratedUser)
      localStorage.setItem("visionix_user", JSON.stringify(hydratedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check stored users
    const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
    const foundUser = storedUsers.find((u: { email: string; password: string }) => u.email === email)
    
    if (!foundUser) {
      setIsLoading(false)
      return { success: false, error: "No account found with this email" }
    }
    
    if (foundUser.password !== password) {
      setIsLoading(false)
      return { success: false, error: "Incorrect password" }
    }
    
    const userData: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      plan: resolvePlan(foundUser.email, foundUser.plan),
      avatar: foundUser.avatar,
      companyName: foundUser.companyName,
      smbType: foundUser.smbType,
      businessType: foundUser.businessType,
      isSetupComplete: foundUser.isSetupComplete,
      isAdmin: resolveAdmin(foundUser.email),
    }
    
    setUser(userData)
    localStorage.setItem("visionix_user", JSON.stringify(userData))
    setIsLoading(false)
    
    return { success: true }
  }

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Check if user already exists
    const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
    const existingUser = storedUsers.find((u: { email: string }) => u.email === email)
    
    if (existingUser) {
      setIsLoading(false)
      return { success: false, error: "An account with this email already exists" }
    }
    
    // Create new user
    const newUser = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      plan: resolvePlan(email),
      isSetupComplete: false,
    }
    
    storedUsers.push(newUser)
    localStorage.setItem("visionix_users", JSON.stringify(storedUsers))
    
    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      plan: resolvePlan(newUser.email, newUser.plan),
      avatar: undefined,
      isSetupComplete: false,
      isAdmin: resolveAdmin(newUser.email),
    }
    
    setUser(userData)
    localStorage.setItem("visionix_user", JSON.stringify(userData))
    setIsLoading(false)
    
    return { success: true }
  }

  const loginWithGoogle = async (profile: { name: string; email: string; picture?: string }): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 400))

    const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
    let existingUser = storedUsers.find((u: { email: string }) => u.email === profile.email)

    if (!existingUser) {
      existingUser = {
        id: crypto.randomUUID(),
        name: profile.name,
        email: profile.email,
        plan: resolvePlan(profile.email),
        avatar: profile.picture,
        password: null,
        isSetupComplete: false,
      }
      storedUsers.push(existingUser)
      localStorage.setItem("visionix_users", JSON.stringify(storedUsers))
    } else if (profile.picture && existingUser.avatar !== profile.picture) {
      existingUser.avatar = profile.picture
      localStorage.setItem("visionix_users", JSON.stringify(storedUsers))
    }

    const userData: User = {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      plan: resolvePlan(existingUser.email, existingUser.plan),
      avatar: existingUser.avatar,
      companyName: existingUser.companyName,
      smbType: existingUser.smbType,
      businessType: existingUser.businessType,
      isSetupComplete: existingUser.isSetupComplete,
      isAdmin: resolveAdmin(existingUser.email),
    }

    setUser(userData)
    localStorage.setItem("visionix_user", JSON.stringify(userData))
    setIsLoading(false)
    return { success: true }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("visionix_user")
    router.push("/")
  }

  const updateUser = (data: Partial<User>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...data, plan: resolvePlan(data.email || user.email, data.plan || user.plan) }
    setUser(updatedUser)
    localStorage.setItem("visionix_user", JSON.stringify(updatedUser))
    
    // Also update in users list
    const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
    const userIndex = storedUsers.findIndex((u: { id: string }) => u.id === user.id)
    if (userIndex !== -1) {
      storedUsers[userIndex] = { ...storedUsers[userIndex], ...data }
      localStorage.setItem("visionix_users", JSON.stringify(storedUsers))
    }
  }

  const deleteCurrentUser = () => {
    if (!user) return

    const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
    const filteredUsers = storedUsers.filter((u: { id: string; email: string }) => u.id !== user.id && u.email !== user.email)

    localStorage.setItem("visionix_users", JSON.stringify(filteredUsers))
    localStorage.removeItem("visionix_user")
    setUser(null)
    router.push("/auth/login")
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, loginWithGoogle, logout, updateUser, deleteCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
