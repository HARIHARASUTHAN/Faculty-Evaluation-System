"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDepartments, getFinalScores, type Department, type FinalScore, KPI_CATEGORIES } from "@/lib/firestore"
import { BarChart3, TrendingUp, Award } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts"

export function ReportsPage() {
  const [deptData, setDeptData] = useState<any[]>([])
  const [topFaculty, setTopFaculty] = useState<FinalScore[]>([])
  const [categoryAvg, setCategoryAvg] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [depts, scores] = await Promise.all([getDepartments(), getFinalScores()])

        // Dept performance
        const deptMap = new Map<string, { name: string; total: number; count: number }>()
        depts.forEach(d => deptMap.set(d.id, { name: d.departmentName, total: 0, count: 0 }))
        scores.forEach(s => {
          const e = deptMap.get(s.departmentId)
          if (e) { e.total += s.totalScore; e.count++ }
        })
        setDeptData(Array.from(deptMap.values()).map(d => ({
          name: d.name.length > 14 ? d.name.slice(0, 14) + "…" : d.name,
          avg: d.count > 0 ? Math.round(d.total / d.count * 10) / 10 : 0,
        })))

        // Top faculty — deduplicate by facultyId, keep only latest score
        const latestByFaculty = new Map<string, FinalScore>()
        scores.forEach(s => {
          const existing = latestByFaculty.get(s.facultyId)
          if (!existing || (s.submittedAt > existing.submittedAt)) {
            latestByFaculty.set(s.facultyId, s)
          }
        })
        setTopFaculty(Array.from(latestByFaculty.values()).sort((a, b) => b.totalScore - a.totalScore).slice(0, 5))

        // Category averages across all scores
        const catTotals: Record<string, { total: number; count: number }> = {}
        KPI_CATEGORIES.forEach(c => catTotals[c.id] = { total: 0, count: 0 })
        scores.forEach(s => {
          if (s.categoryScores) {
            Object.entries(s.categoryScores).forEach(([catId, cs]: [string, any]) => {
              if (catTotals[catId]) { catTotals[catId].total += cs.weightedScore; catTotals[catId].count++ }
            })
          }
        })
        setCategoryAvg(KPI_CATEGORIES.map(c => {
          const rawAvg = catTotals[c.id].count > 0 ? Math.round(catTotals[c.id].total / catTotals[c.id].count * 10) / 10 : 0
          return {
            name: c.name.length > 12 ? c.name.slice(0, 12) + "…" : c.name,
            fullName: c.name,
            avg: Math.min(rawAvg, c.weightage),
            max: c.weightage,
          }
        }))
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-64 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Reports & Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">Department-wise performance and faculty rankings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dept chart */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="font-display text-lg">Department Performance</CardTitle></CardHeader>
          <CardContent>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptData}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }} />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>

        {/* Category averages */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="font-display text-lg">Category-wise Averages</CardTitle></CardHeader>
          <CardContent>
            {categoryAvg.some(c => c.avg > 0) ? (
              <div className="space-y-3">
                {categoryAvg.map(c => (
                  <div key={c.fullName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{c.fullName}</span>
                      <span className="font-medium text-foreground">{c.avg}/{c.max}</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400" style={{ width: `${c.max > 0 ? (c.avg / c.max) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No data</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Faculty */}
      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="font-display text-lg flex items-center gap-2"><Award className="h-5 w-5 text-accent" />Top Performing Faculty</CardTitle></CardHeader>
        <CardContent>
          {topFaculty.length > 0 ? (
            <div className="space-y-3">
              {topFaculty.map((f, i) => (
                <div key={f.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg font-display font-bold text-sm ${i === 0 ? "bg-accent/15 text-accent" : i === 1 ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground"}`}>
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{f.facultyName}</p>
                    <p className="text-xs text-muted-foreground">{f.departmentName} • {f.academicYear}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-foreground">{f.totalScore}<span className="text-xs text-muted-foreground">/100</span></p>
                    <p className={`text-xs font-medium ${f.grade === "A" ? "text-accent" : f.grade === "B" ? "text-primary" : "text-amber-400"}`}>Grade {f.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">No evaluations completed yet</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
