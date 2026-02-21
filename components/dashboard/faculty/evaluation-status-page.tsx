"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getEvaluationsByFaculty, type Evaluation } from "@/lib/firestore"
import { CheckCircle, Clock, FileSearch, Send, Loader2 } from "lucide-react"

const stepIcons = [
  <Send key="s" className="h-5 w-5" />,
  <FileSearch key="f" className="h-5 w-5" />,
  <CheckCircle key="c" className="h-5 w-5" />,
  <Clock key="cl" className="h-5 w-5" />,
]

const stepLabels = [
  "Self Evaluation Submitted",
  "Under Review by Evaluator",
  "Evaluation Completed",
  "Feedback Available",
]

function getActiveStep(status: string): number {
  switch (status) {
    case "submitted": return 1
    case "under-review": return 2
    case "evaluated": return 4
    default: return 0
  }
}

export function EvaluationStatusPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const evals = await getEvaluationsByFaculty(user!.uid)
        setEvaluations(evals)
      } catch { console.error("Failed to load evaluations") } finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  if (loading) return <div className="flex flex-col gap-6"><div className="h-12 skeleton-shimmer rounded-xl" /><div className="h-64 skeleton-shimmer rounded-xl" /></div>

  const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null
  const activeStep = latestEval ? getActiveStep(latestEval.status) : 0

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Evaluation Status</h2>
        <p className="text-sm text-muted-foreground">Track the progress of your performance evaluation</p>
      </div>

      <Card className="premium-card border-border bg-card animate-fade-in-up">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base">Academic Year 2024-25</CardTitle>
            <Badge className={latestEval?.status === "evaluated" ? "bg-accent/15 text-accent hover:bg-accent/20 border-0" : "bg-chart-3/15 text-chart-3 border-0"}>
              {latestEval?.status === "evaluated" ? "Completed" : "In Progress"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0">
            {stepLabels.map((label, i) => {
              const done = i < activeStep
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${done ? "bg-accent text-accent-foreground shadow-md shadow-accent/20" : "bg-secondary text-muted-foreground"}`}>
                      {stepIcons[i]}
                    </div>
                    {i < stepLabels.length - 1 && <div className={`h-12 w-0.5 ${done ? "bg-accent/40" : "bg-border"}`} />}
                  </div>
                  <div className="flex flex-col pb-8 pt-2">
                    <span className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                    <span className="text-xs text-muted-foreground">{done ? "Completed" : "Pending"}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Past evaluations */}
      {evaluations.length > 0 && (
        <Card className="premium-card border-border bg-card animate-fade-in-up stagger-2">
          <CardHeader><CardTitle className="font-display text-base">Past Evaluations</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {evaluations.map((ev) => (
                <div key={ev.id} className="flex items-center justify-between rounded-xl border border-border p-4 premium-card">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{ev.academicYear}</span>
                    <span className="text-xs text-muted-foreground capitalize">{ev.status}</span>
                  </div>
                  <span className="font-display text-xl font-bold gradient-text">{ev.finalScore || "—"}/100</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
