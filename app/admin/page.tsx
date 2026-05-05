"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Users, 
  ShieldCheck, 
  Crown, 
  ArrowLeft, 
  Search, 
  MoreVertical,
  Mail,
  Building2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  XCircle
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

interface StoredUser {
  id: string
  name: string
  email: string
  plan?: "free" | "pro"
  companyName?: string
  smbType?: string
  businessType?: string
  isSetupComplete?: boolean
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState<StoredUser[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!authLoading) {
      if (!user || !user.isAdmin) {
        router.push("/dashboard")
      } else {
        loadUsers()
      }
    }
  }, [user, authLoading, router])

  const loadUsers = () => {
    setIsLoading(true)
    try {
      const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
      setUsers(storedUsers)
    } catch (e) {
      console.error("Failed to load users", e)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlan = (userId: string) => {
    const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
    const updatedUsers = storedUsers.map((u: StoredUser) => {
      if (u.id === userId) {
        return { ...u, plan: u.plan === "pro" ? "free" : "pro" }
      }
      return u
    })
    localStorage.setItem("visionix_users", JSON.stringify(updatedUsers))
    
    // Also update current user session if it's the same user
    if (user?.id === userId) {
        const currentUser = JSON.parse(localStorage.getItem("visionix_user") || "{}")
        currentUser.plan = currentUser.plan === "pro" ? "free" : "pro"
        localStorage.setItem("visionix_user", JSON.stringify(currentUser))
    }
    
    setUsers(updatedUsers)
  }

  const deleteUser = (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    
    const storedUsers = JSON.parse(localStorage.getItem("visionix_users") || "[]")
    const updatedUsers = storedUsers.filter((u: StoredUser) => u.id !== userId)
    localStorage.setItem("visionix_users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.companyName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner size={40} />
      </div>
    )
  }

  if (!user?.isAdmin) return null

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,rgba(247,251,255,1)_0%,rgba(232,242,255,1)_55%,rgba(211,230,255,1)_100%)] dark:bg-[radial-gradient(circle_at_top,_rgba(18,96,255,0.16),_transparent_28%),linear-gradient(180deg,_#07111f_0%,_#060b14_100%)] text-foreground">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(56,113,219,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(56,113,219,0.04)_1px,transparent_1px)] bg-[size:72px_72px] pointer-events-none" />
      
      <header className="relative z-10 border-b border-border/40 bg-background/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl ring-1 ring-blue-200 dark:ring-white/10">
                <Image src="/visionix-logo.png" alt="Visionix" fill className="object-cover" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">VISIONIX ADMIN</h1>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">User Management & Premium Control</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20 px-3 py-1">
               <ShieldCheck className="h-3 w-3 mr-1.5" />
               Admin Access
             </Badge>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card className="glass-card motion-surface border-blue-200/50 bg-white/70 dark:bg-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <div className="h-10 w-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-950 dark:text-white">{users.length}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-muted-foreground mt-2">Active accounts on platform</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card motion-surface border-amber-200/50 bg-white/70 dark:bg-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Pro Users</p>
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                  <Crown className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-950 dark:text-white">{users.filter(u => u.plan === "pro").length}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-muted-foreground mt-2">Premium subscribers</p>
            </CardContent>
          </Card>

          <Card className="glass-card motion-surface border-emerald-200/50 bg-white/70 dark:bg-white/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Setup Complete</p>
                <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
              <p className="text-4xl font-bold text-slate-950 dark:text-white">{users.filter(u => u.isSetupComplete).length}</p>
              <p className="text-xs font-medium text-slate-600 dark:text-muted-foreground mt-2">Users who finished onboarding</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">User Directory</h2>
              <p className="text-muted-foreground">Monitor and manage all users on the Visionix platform.</p>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, email, or company..." 
                className="pl-10 h-11 bg-white/50 backdrop-blur-sm border-border/60 rounded-2xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <Card className="glass-card overflow-hidden border-border/40 bg-white/60 dark:bg-slate-950/40 rounded-[28px]">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/40">
                  <TableHead className="w-[250px] py-5">User</TableHead>
                  <TableHead>Business Details</TableHead>
                  <TableHead>Scale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                      No users found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => (
                    <TableRow key={u.id} className="group border-border/20 hover:bg-blue-500/5 transition-colors">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-[linear-gradient(135deg,#62c8ff_0%,#2d63ff_100%)] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-sm text-slate-950 dark:text-white">{u.name}</span>
                            <span className="text-xs font-medium text-slate-600 dark:text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" /> {u.email}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-500" />
                            {u.companyName || "N/A"}
                          </span>
                          <span className="text-xs font-medium text-slate-600 dark:text-muted-foreground">{u.businessType || "Not specified"}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {u.smbType ? (
                          <Badge variant="secondary" className="capitalize text-[10px] font-semibold bg-slate-200 dark:bg-white/10">
                            {u.smbType}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {u.isSetupComplete ? (
                          <div className="flex items-center text-emerald-700 dark:text-emerald-500 text-xs font-bold gap-1.5">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Setup Complete
                          </div>
                        ) : (
                          <div className="flex items-center text-amber-700 dark:text-amber-500 text-xs font-bold gap-1.5">
                            <XCircle className="h-3.5 w-3.5" />
                            Onboarding
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={u.plan === "pro" 
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20" 
                            : "bg-slate-500/10 text-slate-600 border-slate-500/20"
                          }
                          variant="outline"
                        >
                          {u.plan === "pro" ? "PRO" : "FREE"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl border-border/40">
                            <DropdownMenuItem onClick={() => togglePlan(u.id)} className="cursor-pointer">
                              {u.plan === "pro" ? <XCircle className="h-4 w-4 mr-2" /> : <Crown className="h-4 w-4 mr-2" />}
                              {u.plan === "pro" ? "Downgrade to Free" : "Upgrade to Pro"}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-600 cursor-pointer" onClick={() => deleteUser(u.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>
    </div>
  )
}
