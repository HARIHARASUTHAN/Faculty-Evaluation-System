"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
  getDocumentsByFaculty, getFinalScoresByFaculty, getActiveCycle, getFinalScores,
  type FacultyDocument, type FinalScore, type EvaluationCycle
} from "@/lib/firestore"
import { Upload, FileText, CheckCircle, Clock, XCircle, TrendingUp, CalendarClock, Award } from "lucide-react"

export function FacultyOverview() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<FacultyDocument[]>([])
  const [scores, setScores] = useState<FinalScore[]>([])
  const [activeCycle, setActiveCycle] = useState<EvaluationCycle | null>(null)
  const [topFaculty, setTopFaculty] = useState<FinalScore[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!user?.uid) { setLoading(false); return }
      try {
        const [d, s, c, allScores] = await Promise.all([
          getDocumentsByFaculty(user.uid),
          getFinalScoresByFaculty(user.uid),
          getActiveCycle(),
          getFinalScores(),
        ])
        setDocs(d)
        setScores(s)
        setActiveCycle(c)

        // Top faculty — deduplicate by facultyId, keep only latest score
        const latestByFaculty = new Map<string, FinalScore>()
        allScores.forEach(sc => {
          const existing = latestByFaculty.get(sc.facultyId)
          if (!existing || (sc.submittedAt > existing.submittedAt)) {
            latestByFaculty.set(sc.facultyId, sc)
          }
        })
        setTopFaculty(Array.from(latestByFaculty.values()).sort((a, b) => b.totalScore - a.totalScore).slice(0, 5))
      } catch (err) { console.error(err) }
      setLoading(false)
    }
    load()
  }, [user])

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
  }

  const pending = docs.filter(d => d.status === "pending").length
  const approved = docs.filter(d => d.status === "approved").length
  const rejected = docs.filter(d => d.status === "rejected").length
  const latestScore = scores.length > 0 ? scores.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0] : null

  const cards = [
    { label: "Documents Uploaded", value: docs.length, icon: Upload, gradient: "stat-card-gradient-blue" },
    { label: "Pending Review", value: pending, icon: Clock, gradient: "stat-card-gradient-amber" },
    { label: "Approved", value: approved, icon: CheckCircle, gradient: "stat-card-gradient-green" },
    { label: "Latest Score", value: latestScore ? `${latestScore.totalScore}/100` : "—", icon: TrendingUp, gradient: "stat-card-gradient-purple" },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display text-2xl font-bold text-foreground">{user?.name || "Faculty"}</h2>
        <p className="text-sm text-muted-foreground mt-1">{user?.departmentName || "Faculty Member"}</p>
        {activeCycle && (
          <div className="flex items-center gap-2 mt-3 text-xs text-primary">
            <CalendarClock className="h-4 w-4" />
            Active Cycle: <span className="font-semibold">{activeCycle.academicYear}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card, i) => (
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

      {/* Recent activity */}
      {rejected > 0 && (
        <Card className="glass-card border-destructive/20">
          <CardContent className="p-5 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-foreground">
              <span className="font-bold text-destructive">{rejected}</span> document(s) rejected.
              You can re-upload under <span className="text-primary font-medium">Upload Documents</span>.
            </p>
          </CardContent>
        </Card>
      )}

      {latestScore && (
        <Card className="glass-card border-border/50">
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Latest Evaluation</p>
            <div className="flex items-center gap-6">
              <div>
                <p className="font-display text-4xl font-bold text-foreground">{latestScore.totalScore}</p>
                <p className="text-xs text-muted-foreground">/100</p>
              </div>
              <div className={`font-display text-2xl font-bold ${latestScore.grade === "A" ? "text-accent" : latestScore.grade === "B" ? "text-primary" : latestScore.grade === "C" ? "text-amber-400" : "text-destructive"}`}>
                Grade {latestScore.grade}
              </div>
              <div className="text-xs text-muted-foreground">{latestScore.academicYear}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Faculty */}
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
