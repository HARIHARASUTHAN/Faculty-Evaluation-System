"use client"

import { AuthProvider, useAuth } from "@/lib/auth-context"
import { LoginForm } from "@/components/auth/login-form"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { Loader2 } from "lucide-react"

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="bg-gradient-orb bg-gradient-orb-1" />
        <div className="bg-gradient-orb bg-gradient-orb-2" />
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LoginForm />
  }

  return <DashboardShell />
}

export default function Home() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}
