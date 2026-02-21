"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getEvaluationsByFaculty, getCriteria, type Evaluation, type Criteria } from "@/lib/firestore"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

export function FeedbackPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const [evals, crit] = await Promise.all([getEvaluationsByFaculty(user!.uid), getCriteria()])
        setEvaluations(evals.filter(e => e.status === "evaluated"))
        setCriteria(crit)
      } catch { console.error("Failed to load feedback") } finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  if (loading) return <div className="flex flex-col gap-6"><div className="h-24 skeleton-shimmer rounded-xl" /><div className="h-64 skeleton-shimmer rounded-xl" /></div>

  const latestEval = evaluations.length > 0 ? evaluations[evaluations.length - 1] : null

  const chartData = criteria.map(c => ({
    name: c.title.split(" ")[0],
    score: latestEval?.scores[c.id] || 0,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">View Feedback</h2>
        <p className="text-sm text-muted-foreground">Feedback from your evaluator for the academic year</p>
      </div>

      {!latestEval ? (
        <Card className="border-border bg-card"><CardContent className="py-12 text-center text-muted-foreground">No feedback available yet. Your evaluation must be completed first.</CardContent></Card>
      ) : (
        <>
          {/* Overall score */}
          <Card className="premium-card border-border bg-card animate-fade-in-up">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <p className="text-sm text-muted-foreground">Overall Performance Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-5xl font-bold gradient-text">{latestEval.finalScore}</span>
                    <span className="text-lg text-muted-foreground">/100</span>
                  </div>
                </div>
                <Badge className="w-fit bg-accent/15 text-accent hover:bg-accent/20 border-0 text-sm px-5 py-2">
                  {latestEval.finalScore >= 80 ? "Excellent" : latestEval.finalScore >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Chart */}
          {chartData.length > 0 && (
            <Card className="premium-card border-border bg-card animate-fade-in-up stagger-2">
              <CardHeader><CardTitle className="font-display text-base">Criteria-wise Scores</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(225,15%,18%)" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} stroke="hsl(225,15%,18%)" />
                    <YAxis domain={[0, 100]} stroke="hsl(225,15%,18%)" tick={{ fontSize: 11, fill: "hsl(215,20%,55%)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(225,25%,13%)", border: "1px solid hsl(225,15%,20%)", borderRadius: "12px", color: "hsl(210,40%,96%)" }} />
                    <Bar dataKey="score" fill="hsl(217,91%,60%)" radius={[8, 8, 0, 0]} name="Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card className="premium-card border-border bg-card animate-fade-in-up stagger-3">
            <CardHeader><CardTitle className="font-display text-base">Evaluator Comments</CardTitle></CardHeader>
            <CardContent>
              <div className="rounded-xl bg-secondary/40 p-5">
                <p className="mb-2 text-sm font-medium text-foreground">Evaluator Feedback</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{latestEval.comments || "No comments provided."}</p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
