"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAdminDashboardStats, getDepartments, getFinalScores, getDocuments, type Department, type FacultyDocument } from "@/lib/firestore"
import { Users, Building2, FileText, TrendingUp, AlertTriangle, CalendarClock, CheckCircle, Clock } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Trophy, Award, Star } from "lucide-react"

export function AdminOverview() {
  const [stats, setStats] = useState<any>(null)
  const [deptPerformance, setDeptPerformance] = useState<any[]>([])
  const [deptDocStatus, setDeptDocStatus] = useState<any[]>([])
  const [topFaculty, setTopFaculty] = useState<any[]>([])
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

        // Compute department-wise document counts for pie chart and table
        const COLORS = ["#3b82f6", "#ec4899", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#14b8a6", "#f97316"]
        const docsByDept = new Map<string, { name: string; count: number; approved: number; rejected: number; pending: number }>()
        depts.forEach(d => docsByDept.set(d.id, { name: d.departmentName, count: 0, approved: 0, rejected: 0, pending: 0 }))
        allDocs.forEach(doc => {
          const entry = docsByDept.get(doc.departmentId)
          if (entry) {
            entry.count++
            if (doc.status === "approved") entry.approved++
            else if (doc.status === "rejected") entry.rejected++
            else if (doc.status === "pending") entry.pending++
          }
        })
        setDeptDocStatus(
          Array.from(docsByDept.values())
            .filter(d => d.count > 0)
            .map((d, i) => ({ ...d, value: d.count, color: COLORS[i % COLORS.length] }))
        )

        // Compute top performing faculty - deduplicate by facultyId, keep only latest score
        const latestByFaculty = new Map<string, any>()
        scores.forEach(s => {
          const existing = latestByFaculty.get(s.facultyId)
          if (!existing || (s.submittedAt > existing.submittedAt)) {
            latestByFaculty.set(s.facultyId, s)
          }
        })
        const facultyList = Array.from(latestByFaculty.values())
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, 5)
          .map(f => ({
            id: f.id,
            name: f.facultyName,
            dept: f.departmentName,
            score: f.totalScore,
            academicYear: f.academicYear
          }))
        setTopFaculty(facultyList)
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

        {/* Top Performing Faculty */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-accent" />
              Top Performing Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topFaculty.length > 0 ? (
              <div className="space-y-3">
                {topFaculty.map((f, i) => (
                  <div key={f.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg font-display font-bold text-sm ${i === 0 ? "bg-accent/15 text-accent" : i === 1 ? "bg-primary/15 text-primary" : "bg-secondary/50 text-muted-foreground"}`}>
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{f.dept} • {f.academicYear}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-display font-bold text-foreground">
                        {f.score}
                        <span className="text-[10px] text-muted-foreground ml-0.5">/100</span>
                      </p>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
                <Users className="h-12 w-12 mb-3 opacity-30" />
                <p className="text-sm">No performance data yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Department-wise Document Data Table */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <CardHeader>
          <CardTitle className="font-display text-lg">Department-wise Document Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/20 hover:bg-secondary/20 border-b border-border">
                  <TableHead className="w-[40%] font-semibold text-foreground">Department</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Approved</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Pending</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Rejected</TableHead>
                  <TableHead className="font-semibold text-foreground text-center">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deptDocStatus.length > 0 ? (
                  deptDocStatus.map((dept, idx) => (
                    <TableRow key={idx} className="hover:bg-secondary/10 border-b border-border/50">
                      <TableCell className="font-medium text-foreground">{dept.name}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-accent/10 border-accent/20 text-accent font-semibold">{dept.approved}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-amber-500/10 border-amber-500/20 text-amber-500 font-semibold">{dept.pending}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-destructive/10 border-destructive/20 text-destructive font-semibold">{dept.rejected}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-bold text-foreground">{dept.value}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No document data available.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
