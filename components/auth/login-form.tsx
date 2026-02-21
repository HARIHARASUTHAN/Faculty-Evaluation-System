"use client"

import React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GraduationCap, Loader2, Mail, Lock, ArrowLeft, Shield, Users, BarChart3 } from "lucide-react"
import { toast } from "sonner"

export function LoginForm() {
  const { login, loginWithGoogle, resetPassword, isLoading } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || "Login failed")
    }
  }

  async function handleGoogleSignIn() {
    setError("")
    const result = await loginWithGoogle()
    if (!result.success) {
      setError(result.error || "Google sign-in failed")
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    const result = await resetPassword(resetEmail)
    if (result.success) {
      setResetSent(true)
      toast.success("Password reset email sent!")
    } else {
      toast.error(result.error || "Failed to send reset email")
    }
  }

  if (showForgotPassword) {
    return (
      <div className="login-bg grid-pattern flex min-h-screen items-center justify-center p-4">
        <div className="bg-gradient-orb bg-gradient-orb-1" />
        <div className="bg-gradient-orb bg-gradient-orb-2" />
        <div className="bg-gradient-orb bg-gradient-orb-3" />

        <div className="relative z-10 w-full max-w-md animate-fade-in-up">
          <div className="glass-card rounded-2xl p-8">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {resetSent ? "Check Your Email" : "Reset Password"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {resetSent
                  ? "We've sent a password reset link to your email"
                  : "Enter your email to receive a password reset link"}
              </p>
            </div>

            {resetSent ? (
              <div className="mt-8 flex flex-col gap-4">
                <div className="rounded-xl bg-accent/10 border border-accent/20 p-4 text-center">
                  <p className="text-sm text-accent">
                    A reset link has been sent to <strong>{resetEmail}</strong>
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setShowForgotPassword(false)
                    setResetSent(false)
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="mt-8 flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="reset-email" className="text-sm text-muted-foreground">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="you@university.edu"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="h-12 bg-secondary/50 border-border pl-11 focus:border-primary"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="h-12 w-full bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90 font-medium"
                >
                  Send Reset Link
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-muted-foreground hover:text-foreground"
                  onClick={() => setShowForgotPassword(false)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-bg grid-pattern flex min-h-screen">
      <div className="bg-gradient-orb bg-gradient-orb-1" />
      <div className="bg-gradient-orb bg-gradient-orb-2" />
      <div className="bg-gradient-orb bg-gradient-orb-3" />

      {/* Left side — branding (hidden on mobile) */}
      <div className="relative z-10 hidden w-1/2 items-center justify-center p-12 lg:flex">
        <div className="max-w-lg animate-fade-in-up">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight">
            <span className="gradient-text">Faculty Performance</span>
            <br />
            <span className="text-foreground">Evaluation System</span>
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            A modern, comprehensive platform for managing faculty evaluations, tracking performance, and
            generating actionable insights for academic excellence.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: <Shield className="h-5 w-5 text-primary" />, label: "Secure Auth", desc: "Firebase powered" },
              { icon: <Users className="h-5 w-5 text-accent" />, label: "Multi-Role", desc: "Admin • Faculty • HOD" },
              {
                icon: <BarChart3 className="h-5 w-5 text-chart-5" />,
                label: "Analytics",
                desc: "Rich reports",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`glass-card rounded-xl p-4 animate-fade-in-up stagger-${i + 2}`}
              >
                <div className="mb-2">{item.icon}</div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side — login form */}
      <div className="relative z-10 flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <h1 className="font-display text-2xl font-bold gradient-text">FPES</h1>
            <p className="mt-1 text-sm text-muted-foreground">Faculty Performance Evaluation System</p>
          </div>

          <div className="glass-card rounded-2xl p-8">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">Welcome back</h2>
              <p className="mt-1 text-sm text-muted-foreground">Sign in to access your dashboard</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-secondary/50 border-border pl-11 focus:border-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm text-muted-foreground">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-primary hover:text-primary/80 hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 bg-secondary/50 border-border pl-11 focus:border-primary"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 animate-fade-in">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="h-12 w-full bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90 font-medium text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Google Sign-In */}
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full bg-secondary/30 border-border hover:bg-secondary/60 font-medium text-foreground"
              disabled={isLoading}
              onClick={handleGoogleSignIn}
            >
              <svg className="mr-2.5 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign in with Google
            </Button>

            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs text-center text-muted-foreground">
                Protected by Firebase Authentication
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
