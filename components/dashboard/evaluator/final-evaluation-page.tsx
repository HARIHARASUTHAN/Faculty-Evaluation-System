"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { evaluations, evaluationCriteria } from "@/lib/dummy-data"
import { Send, CheckCircle } from "lucide-react"

const pendingEvals = evaluations.filter(
  (e) => e.evaluatorId === "u3" && (e.status === "submitted" || e.status === "under-review")
)

export function FinalEvaluationPage() {
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())
  const [confirmed, setConfirmed] = useState(false)

  function handleSubmit(id: string) {
    setSubmitted((prev) => new Set(prev).add(id))
    setConfirmed(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Final Evaluation Submit</h2>
        <p className="text-sm text-muted-foreground">
          Review and submit final evaluations for assigned faculty
        </p>
      </div>

      {pendingEvals.length === 0 && submitted.size === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <CheckCircle className="h-12 w-12 text-accent" />
            <h3 className="font-display text-lg font-bold text-foreground">All Evaluations Complete</h3>
            <p className="text-sm text-muted-foreground">
              All assigned faculty evaluations have been submitted.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {pendingEvals.map((ev) => {
            const isSubmitted = submitted.has(ev.id)
            return (
              <Card key={ev.id} className="border-border bg-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <CardTitle className="font-display text-base">{ev.facultyName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{ev.department} | {ev.academicYear}</p>
                    </div>
                    {isSubmitted ? (
                      <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-0">
                        Submitted
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-chart-3 text-chart-3">
                        Pending
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Score summary */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {evaluationCriteria.map((c) => (
                      <div key={c.id} className="rounded-lg bg-muted/50 p-3 text-center">
                        <p className="text-xs text-muted-foreground">{c.name.split(" ")[0]}</p>
                        <p className="font-display text-lg font-bold text-foreground">
                          {ev.scores[c.id]}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl bg-primary/5 p-4">
                    <span className="font-medium text-foreground">Overall Score</span>
                    <span className="font-display text-2xl font-bold text-primary">{ev.overallScore}</span>
                  </div>

                  {ev.comments && (
                    <div className="mt-4 rounded-xl bg-muted/50 p-4">
                      <p className="text-sm text-muted-foreground">{ev.comments}</p>
                    </div>
                  )}

                  {!isSubmitted && (
                    <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`confirm-${ev.id}`}
                          checked={confirmed}
                          onCheckedChange={(v) => setConfirmed(!!v)}
                        />
                        <Label htmlFor={`confirm-${ev.id}`} className="text-sm text-muted-foreground">
                          I confirm this evaluation is accurate and final
                        </Label>
                      </div>
                      <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!confirmed}
                        onClick={() => handleSubmit(ev.id)}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Submit Final Evaluation
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
