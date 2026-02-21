"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuth } from "@/lib/auth-context"
import { getEvaluationsByEvaluator, type Evaluation } from "@/lib/firestore"
import { Eye, Users } from "lucide-react"

export function AssignedFacultyPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const evals = await getEvaluationsByEvaluator(user!.uid)
        setEvaluations(evals)
      } catch { console.error("Failed") } finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  if (loading) return <div className="flex flex-col gap-6"><div className="h-12 skeleton-shimmer rounded-xl" /><div className="h-64 skeleton-shimmer rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Assigned Faculty</h2>
        <p className="text-sm text-muted-foreground">Faculty members assigned to you for evaluation</p>
      </div>

      <Card className="premium-card border-border bg-card">
        <CardHeader><CardTitle className="font-display text-base">Faculty List ({evaluations.length})</CardTitle></CardHeader>
        <CardContent>
          {evaluations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12"><Users className="h-10 w-10 text-muted-foreground/40" /><p className="text-muted-foreground">No faculty assigned yet.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="border-border"><TableHead>Name</TableHead><TableHead>Department</TableHead><TableHead>Year</TableHead><TableHead>Status</TableHead><TableHead className="text-center">Score</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {evaluations.map(ev => (
                    <TableRow key={ev.id} className="border-border table-row-hover">
                      <TableCell className="font-medium text-foreground">{ev.facultyName}</TableCell>
                      <TableCell className="text-muted-foreground">{ev.department}</TableCell>
                      <TableCell className="text-muted-foreground">{ev.academicYear}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={ev.status === "evaluated" ? "border-accent text-accent" : ev.status === "submitted" ? "border-primary text-primary" : ev.status === "under-review" ? "border-chart-3 text-chart-3" : "border-muted-foreground text-muted-foreground"}>{ev.status}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-display font-bold text-foreground">{ev.finalScore || "—"}</TableCell>
                      <TableCell className="text-right"><Button variant="ghost" size="icon"><Eye className="h-4 w-4 text-primary" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
