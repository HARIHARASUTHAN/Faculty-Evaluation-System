"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { getEvaluationsByEvaluator, getCriteria, updateEvaluation, type Evaluation, type Criteria } from "@/lib/firestore"
import { Send, CheckCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function FinalEvaluationPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const [evals, crit] = await Promise.all([getEvaluationsByEvaluator(user!.uid), getCriteria()])
        setEvaluations(evals.filter(e => e.status !== "evaluated"))
        setCriteria(crit)
      } catch { console.error("Failed") } finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  async function handleSubmit(id: string) {
    setSubmitting(id)
    try {
      await updateEvaluation(id, { status: "evaluated" })
      setSubmitted(prev => new Set(prev).add(id))
      setConfirmed(prev => ({ ...prev, [id]: false }))
      toast.success("Final evaluation submitted!")
    } catch { toast.error("Failed to submit") } finally { setSubmitting(null) }
  }

  if (loading) return <div className="flex flex-col gap-6"><div className="h-12 skeleton-shimmer rounded-xl" /><div className="h-64 skeleton-shimmer rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Final Evaluation Submit</h2>
        <p className="text-sm text-muted-foreground">Review and submit final evaluations for assigned faculty</p>
      </div>

      {evaluations.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-4 p-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 animate-count-up">
              <CheckCircle className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">All Evaluations Complete</h3>
            <p className="text-sm text-muted-foreground">All assigned evaluations have been submitted.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {evaluations.map(ev => {
            const isSubmitted = submitted.has(ev.id)
            return (
              <Card key={ev.id} className="premium-card border-border bg-card animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="font-display text-base">{ev.facultyName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{ev.department} | {ev.academicYear}</p>
                    </div>
                    {isSubmitted ? (
                      <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-0">Submitted</Badge>
                    ) : (
                      <Badge variant="outline" className="border-chart-3 text-chart-3">Pending</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {criteria.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                      {criteria.map(c => (
                        <div key={c.id} className="rounded-lg bg-secondary/40 p-3 text-center">
                          <p className="text-xs text-muted-foreground">{c.title.split(" ")[0]}</p>
                          <p className="font-display text-lg font-bold text-foreground">{ev.scores[c.id] || "—"}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-4">
                    <span className="font-medium text-foreground">Overall Score</span>
                    <span className="font-display text-2xl font-bold gradient-text">{ev.finalScore || "—"}</span>
                  </div>

                  {ev.comments && <div className="mt-4 rounded-xl bg-secondary/40 p-4"><p className="text-sm text-muted-foreground">{ev.comments}</p></div>}

                  {!isSubmitted && (
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox id={`confirm-${ev.id}`} checked={confirmed[ev.id] || false} onCheckedChange={v => setConfirmed(prev => ({ ...prev, [ev.id]: !!v }))} />
                        <Label htmlFor={`confirm-${ev.id}`} className="text-sm text-muted-foreground">I confirm this evaluation is accurate and final</Label>
                      </div>
                      <Button
                        className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90"
                        disabled={!confirmed[ev.id] || submitting === ev.id}
                        onClick={() => handleSubmit(ev.id)}
                      >
                        {submitting === ev.id ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Final Evaluation</>}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
