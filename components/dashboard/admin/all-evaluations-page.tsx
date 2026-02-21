"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getFinalScores, type FinalScore, calculateGrade, gradeColor } from "@/lib/firestore"
import { FileText, TrendingUp } from "lucide-react"

export function AllEvaluationsPage() {
  const [scores, setScores] = useState<FinalScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getFinalScores()
        setScores(data.sort((a, b) => b.totalScore - a.totalScore))
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">All Evaluations</h2>
        <p className="text-sm text-muted-foreground mt-1">View final evaluation scores across all faculty</p>
      </div>

      {scores.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-muted-foreground">
          <FileText className="h-14 w-14 mb-3 opacity-20" />
          <p>No evaluations completed yet</p>
        </div>
      ) : (
        <Card className="glass-card border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Faculty</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Year</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Score</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Grade</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Evaluated By</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((s) => (
                  <tr key={s.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{s.facultyName}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.departmentName}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.academicYear}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-display font-bold text-foreground">{s.totalScore}</span>
                      <span className="text-xs text-muted-foreground">/100</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge className={`${s.grade === "A" ? "bg-accent/15 text-accent border-accent/20" : s.grade === "B" ? "bg-primary/15 text-primary border-primary/20" : s.grade === "C" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-destructive/15 text-destructive border-destructive/20"}`}>
                        Grade {s.grade}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{s.hodName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
