"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminDashboardStats, getDepartments, getFinalScores, getDocuments, type Department, type FacultyDocument } from "@/lib/firestore"
import { Users, Building2, FileText, TrendingUp, AlertTriangle, CalendarClock, CheckCircle, Clock } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function AdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [deptPerformance, setDeptPerformance] = useState<any[]>([])
  const [deptDocStatus, setDeptDocStatus] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, depts, scores, allDocs] = await Promise.all([
          getAdminDashboardStats(),
          getDepartments(),
          getFinalScores(),
          getDocuments(),
        ])
        setStats(s)

        // Compute department-wise performance
        const deptMap = new Map<string, { name: string; totalScore: number; count: number }>()
        depts.forEach(d => deptMap.set(d.id, { name: d.departmentName, totalScore: 0, count: 0 }))
        scores.forEach(sc => {
          const entry = deptMap.get(sc.departmentId)
          if (entry) { entry.totalScore += sc.totalScore; entry.count++ }
        })
        setDeptPerformance(Array.from(deptMap.values()).map(d => ({
          name: d.name.length > 12 ? d.name.slice(0, 12) + "…" : d.name,
          avg: d.count > 0 ? Math.round(d.totalScore / d.count * 10) / 10 : 0,
          count: d.count,
        })))

        // Compute department-wise document counts for pie chart
        const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316"]
        const docsByDept = new Map<string, { name: string; count: number }>()
        depts.forEach(d => docsByDept.set(d.id, { name: d.departmentName, count: 0 }))
        allDocs.forEach(doc => {
          const entry = docsByDept.get(doc.departmentId)
          if (entry) entry.count++
        })
        setDeptDocStatus(
          Array.from(docsByDept.values())
            .filter(d => d.count > 0)
            .map((d, i) => ({ name: d.name, value: d.count, color: COLORS[i % COLORS.length] }))
        )
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 rounded-2xl bg-card/50 animate-pulse shimmer" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-card/50 animate-pulse shimmer" />
      </div>
    )
  }

  const statCards = [
    { label: "Total Faculty", value: stats?.totalFaculty ?? 0, icon: Users, gradient: "stat-card-gradient-blue" },
    { label: "Departments", value: stats?.totalDepts ?? 0, icon: Building2, gradient: "stat-card-gradient-green" },
    { label: "Documents Uploaded", value: stats?.totalDocs ?? 0, icon: FileText, gradient: "stat-card-gradient-amber" },
    { label: "Avg Score", value: stats?.avgScore ?? "—", icon: TrendingUp, gradient: "stat-card-gradient-purple" },
  ]

  const TOOLTIP_STYLE = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, color: "hsl(var(--foreground))" }

  return (
    <div className="space-y-6">
      {/* Active cycle banner */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <CalendarClock className="h-5 w-5 text-primary" />
        <span className="text-sm text-muted-foreground">Active Evaluation Cycle:</span>
        <span className="text-sm font-semibold text-foreground">{stats?.activeCycleYear || "No active cycle"}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Card key={i} className={`border-0 ${card.gradient} animate-fade-in-up stagger-${i + 1}`}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                  <p className="mt-2 font-display text-3xl font-bold text-foreground">{card.value}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                  <card.icon className="h-6 w-6 text-foreground/70" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Performance */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            {deptPerformance.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={deptPerformance}>
                  <XAxis dataKey="name" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} domain={[0, 100]} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="avg" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Avg Score" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
                <BarChart className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No evaluation data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Department-wise Document Status */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Department-wise Document Status</CardTitle>
          </CardHeader>
          <CardContent>
            {deptDocStatus.length > 0 ? (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="60%" height={280}>
                  <PieChart>
                    <Pie data={deptDocStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} paddingAngle={2}>
                      {deptDocStatus.map((entry: any, idx: number) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-3">
                  {deptDocStatus.map((d: any) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <div className="h-4 w-4 rounded" style={{ backgroundColor: d.color }} />
                      <span className="text-sm font-medium text-foreground">{d.name}</span>
                      <span className="text-sm font-bold text-foreground ml-auto">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
                <FileText className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No documents uploaded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick info row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <Clock className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending Review</p>
              <p className="font-display text-xl font-bold text-foreground">{stats?.pendingDocs ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <CheckCircle className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Approved</p>
              <p className="font-display text-xl font-bold text-foreground">{stats?.approvedDocs ?? 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rejected</p>
              <p className="font-display text-xl font-bold text-foreground">{stats?.rejectedDocs ?? 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
