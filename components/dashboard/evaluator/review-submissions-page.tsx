"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/lib/auth-context"
import { getEvaluationsByEvaluator, getCriteria, type Evaluation, type Criteria } from "@/lib/firestore"
import { FileText, Download, ExternalLink } from "lucide-react"

export function ReviewSubmissionsPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const [evals, crit] = await Promise.all([getEvaluationsByEvaluator(user!.uid), getCriteria()])
        setEvaluations(evals); setCriteria(crit)
      } catch { console.error("Failed") } finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  const pending = evaluations.filter(e => e.status === "submitted" || e.status === "under-review")
  const completed = evaluations.filter(e => e.status === "evaluated")
  const selected = evaluations.find(e => e.id === selectedId)

  if (loading) return <div className="flex flex-col gap-6"><div className="h-12 skeleton-shimmer rounded-xl" /><div className="h-64 skeleton-shimmer rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Review Submissions</h2>
        <p className="text-sm text-muted-foreground">Review self-evaluation submissions from faculty</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList><TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger><TabsTrigger value="completed">Completed ({completed.length})</TabsTrigger></TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {pending.length === 0 ? (
              <Card className="col-span-full border-border bg-card"><CardContent className="flex flex-col items-center gap-2 p-12 text-center"><FileText className="h-10 w-10 text-muted-foreground/30" /><p className="text-muted-foreground">No pending submissions</p></CardContent></Card>
            ) : pending.map(sub => (
              <Card key={sub.id} className="premium-card border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1"><h3 className="font-medium text-foreground">{sub.facultyName}</h3><p className="text-sm text-muted-foreground">{sub.department}</p></div>
                    <Badge variant="outline" className={sub.status === "submitted" ? "border-primary text-primary" : "border-chart-3 text-chart-3"}>{sub.status}</Badge>
                  </div>
                  {criteria.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {criteria.slice(0, 3).map(c => (
                        <div key={c.id} className="rounded-lg bg-secondary/40 p-2 text-center">
                          <p className="text-xs text-muted-foreground">{c.title.split(" ")[0]}</p>
                          <p className="font-display text-sm font-bold text-foreground">{sub.scores[c.id] || "—"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90" onClick={() => setSelectedId(sub.id)}>
                      <ExternalLink className="mr-2 h-3.5 w-3.5" /> Review
                    </Button>
                    <Button size="sm" variant="outline" className="bg-transparent hover:bg-secondary"><Download className="mr-2 h-3.5 w-3.5" /> Docs</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {completed.map(sub => (
              <Card key={sub.id} className="premium-card border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1"><h3 className="font-medium text-foreground">{sub.facultyName}</h3><p className="text-sm text-muted-foreground">{sub.department}</p></div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl font-bold gradient-text">{sub.finalScore}</span>
                      <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-0">Done</Badge>
                    </div>
                  </div>
                  {sub.comments && <p className="mt-3 text-sm text-muted-foreground">{sub.comments}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selected && (
        <Card className="premium-card border-border bg-card animate-fade-in-up">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base">Reviewing: {selected.facultyName}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>Close</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {criteria.map(c => (
                <div key={c.id} className="rounded-xl border border-border p-3 text-center premium-card">
                  <p className="text-xs text-muted-foreground">{c.title}</p>
                  <p className="font-display text-xl font-bold gradient-text">{selected.scores[c.id] || "—"}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              ))}
            </div>
            {selected.comments && (
              <div className="mt-4 rounded-xl bg-secondary/40 p-4">
                <p className="text-sm font-medium text-foreground">Faculty Comments</p>
                <p className="mt-1 text-sm text-muted-foreground">{selected.comments}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
