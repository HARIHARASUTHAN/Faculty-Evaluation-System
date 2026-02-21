"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getEvaluationsByEvaluator, type Evaluation } from "@/lib/firestore"
import { Users, ClipboardCheck, Clock, CheckCircle, ArrowUpRight } from "lucide-react"

export function EvaluatorOverview() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const evals = await getEvaluationsByEvaluator(user!.uid)
        setEvaluations(evals)
      } catch { console.error("Failed to load evaluator data") } finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  const pending = evaluations.filter(e => e.status === "submitted" || e.status === "under-review")
  const completed = evaluations.filter(e => e.status === "evaluated")
  const avgScore = completed.length > 0 ? Math.round(completed.reduce((s, e) => s + (e.finalScore || 0), 0) / completed.length) : 0

  const stats = [
    { label: "Assigned Faculty", value: evaluations.length.toString(), icon: <Users className="h-5 w-5" />, gradient: "stat-gradient-blue", iconColor: "text-primary" },
    { label: "Pending Reviews", value: pending.length.toString(), icon: <Clock className="h-5 w-5" />, gradient: "stat-gradient-amber", iconColor: "text-chart-3" },
    { label: "Completed", value: completed.length.toString(), icon: <CheckCircle className="h-5 w-5" />, gradient: "stat-gradient-green", iconColor: "text-accent" },
    { label: "Avg Score Given", value: avgScore.toString(), icon: <ClipboardCheck className="h-5 w-5" />, gradient: "stat-gradient-purple", iconColor: "text-chart-5" },
  ]

  if (loading) {
    return <div className="flex flex-col gap-6"><div className="h-24 skeleton-shimmer rounded-xl" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-28 skeleton-shimmer rounded-xl" />)}</div></div>
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="premium-card border-border bg-card animate-fade-in-up">
        <CardContent className="p-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Welcome, <span className="gradient-text">{user?.name}</span>
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluator — Department of {user?.department ?? "—"} | Academic Year 2024-25
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={stat.label} className={`premium-card border-border bg-card animate-fade-in-up stagger-${i + 1}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.gradient}`}>
                  <span className={stat.iconColor}>{stat.icon}</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground/40" />
              </div>
              <div className="mt-4">
                <span className="font-display text-3xl font-bold text-foreground animate-count-up">{stat.value}</span>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="premium-card border-border bg-card animate-fade-in-up stagger-5">
        <CardHeader><CardTitle className="font-display text-base">Recent Activity</CardTitle></CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No evaluations assigned yet.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {evaluations.map(ev => (
                <div key={ev.id} className="flex items-center justify-between rounded-xl border border-border p-4 premium-card">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{ev.facultyName}</span>
                    <span className="text-xs text-muted-foreground">{ev.department}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {ev.finalScore > 0 && <span className="hidden sm:block font-display text-lg font-bold gradient-text">{ev.finalScore}</span>}
                    <Badge variant="outline" className={
                      ev.status === "evaluated" ? "border-accent text-accent" :
                        ev.status === "submitted" ? "border-primary text-primary" :
                          "border-chart-3 text-chart-3"
                    }>{ev.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
