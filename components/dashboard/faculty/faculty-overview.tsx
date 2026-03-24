"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
  getDocumentsByFaculty, getDocumentsByFacultyAndYear, getFinalScoresByFaculty, getActiveCycle, getFinalScores,
  getDocumentEvaluations,
  KPI_CATEGORIES, CATEGORY_TARGETS,
  type FacultyDocument, type FinalScore, type EvaluationCycle
} from "@/lib/firestore"
import { Upload, FileText, CheckCircle, Clock, XCircle, TrendingUp, CalendarClock, Award, Target } from "lucide-react"

export function FacultyOverview() {
  const { user } = useAuth()
  const [docs, setDocs] = useState<FacultyDocument[]>([])
  const [cycleDocs, setCycleDocs] = useState<FacultyDocument[]>([])
  const [evaluatedDocIds, setEvaluatedDocIds] = useState<Set<string>>(new Set())
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

        // Load cycle-specific docs for target tracking
        if (c) {
          const cd = await getDocumentsByFacultyAndYear(user.uid, c.academicYear)
          setCycleDocs(cd)

          // Load evaluations for these docs to check if score awarded
          const evalPromises = cd.map(doc => getDocumentEvaluations(doc.id))
          const evalsResults = await Promise.all(evalPromises)
          const evaluatedSet = new Set<string>()
          evalsResults.forEach((evals, index) => {
            if (evals.length > 0) {
              evaluatedSet.add(cd[index].id)
            }
          })
          setEvaluatedDocIds(evaluatedSet)
        }

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

  // Target tracking: count approved & scored docs per category for active cycle
  const categoryCompletedCounts: Record<string, number> = {}
  cycleDocs.forEach(d => {
    if (d.status === "approved" && evaluatedDocIds.has(d.id)) {
      categoryCompletedCounts[d.category] = (categoryCompletedCounts[d.category] || 0) + 1
    }
  })
  const completedCategories = KPI_CATEGORIES.filter(cat => (categoryCompletedCounts[cat.id] || 0) >= CATEGORY_TARGETS[cat.id]).length



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

      {/* Upload Targets */}
      {activeCycle && (
        <Card className={`glass-card ${completedCategories === KPI_CATEGORIES.length ? "border-accent/30" : "border-primary/20"}`}>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Target className={`h-5 w-5 ${completedCategories === KPI_CATEGORIES.length ? "text-accent" : "text-primary"}`} />
              <p className="text-sm font-semibold text-foreground">
                Targets — {completedCategories} of {KPI_CATEGORIES.length} completed
              </p>
              {completedCategories === KPI_CATEGORIES.length && (
                <span className="ml-auto text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full">All targets met ✓</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
              {KPI_CATEGORIES.map(cat => {
                const completed = categoryCompletedCounts[cat.id] || 0
                const target = CATEGORY_TARGETS[cat.id]
                const isComplete = completed >= target
                return (
                  <div key={cat.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isComplete ? "bg-accent/10 text-accent" : "bg-secondary/30 text-muted-foreground"}`}>
                    {isComplete ? <CheckCircle className="h-3.5 w-3.5 shrink-0" /> : <span className="h-3.5 w-3.5 rounded-full border border-current shrink-0" />}
                    <span className="truncate">{cat.name}</span>
                    <span className="ml-auto font-semibold whitespace-nowrap">{completed}/{target}</span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
