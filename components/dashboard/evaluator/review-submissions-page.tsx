"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { evaluations, evaluationCriteria } from "@/lib/dummy-data"
import { FileText, Download, ExternalLink } from "lucide-react"

const submissions = evaluations.filter(
  (e) => e.evaluatorId === "u3" && (e.status === "submitted" || e.status === "under-review")
)

const completedSubmissions = evaluations.filter(
  (e) => e.evaluatorId === "u3" && e.status === "evaluated"
)

export function ReviewSubmissionsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = evaluations.find((e) => e.id === selectedId)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Review Submissions</h2>
        <p className="text-sm text-muted-foreground">Review self-evaluation submissions from faculty</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({submissions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedSubmissions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {submissions.length === 0 ? (
              <Card className="col-span-full border-border bg-card">
                <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No pending submissions to review</p>
                </CardContent>
              </Card>
            ) : (
              submissions.map((sub) => (
                <Card key={sub.id} className="border-border bg-card">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="font-medium text-foreground">{sub.facultyName}</h3>
                        <p className="text-sm text-muted-foreground">{sub.department}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          sub.status === "submitted"
                            ? "border-primary text-primary"
                            : "border-chart-3 text-chart-3"
                        }
                      >
                        {sub.status}
                      </Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {evaluationCriteria.slice(0, 3).map((c) => (
                        <div key={c.id} className="rounded-lg bg-muted/50 p-2 text-center">
                          <p className="text-xs text-muted-foreground">{c.name.split(" ")[0]}</p>
                          <p className="font-display text-sm font-bold text-foreground">
                            {sub.scores[c.id]}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={() => setSelectedId(sub.id)}
                      >
                        <ExternalLink className="mr-2 h-3.5 w-3.5" />
                        Review
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="mr-2 h-3.5 w-3.5" />
                        Documents
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {completedSubmissions.map((sub) => (
              <Card key={sub.id} className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <h3 className="font-medium text-foreground">{sub.facultyName}</h3>
                      <p className="text-sm text-muted-foreground">{sub.department}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-xl font-bold text-primary">{sub.overallScore}</span>
                      <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-0">Done</Badge>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{sub.comments}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detail view */}
      {selected && (
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-base">
                Reviewing: {selected.facultyName}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {evaluationCriteria.map((c) => (
                <div key={c.id} className="rounded-xl border border-border p-3 text-center">
                  <p className="text-xs text-muted-foreground">{c.name}</p>
                  <p className="font-display text-xl font-bold text-primary">{selected.scores[c.id]}</p>
                  <p className="text-xs text-muted-foreground">/ 100</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-muted/50 p-4">
              <p className="text-sm font-medium text-foreground">Faculty Comments</p>
              <p className="mt-1 text-sm text-muted-foreground">{selected.comments}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
