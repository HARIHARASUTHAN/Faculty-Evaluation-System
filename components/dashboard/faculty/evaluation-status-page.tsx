"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, FileSearch, Send } from "lucide-react"

const steps = [
  { status: "submitted", label: "Self Evaluation Submitted", date: "Jan 5, 2025", icon: <Send className="h-5 w-5" />, done: true },
  { status: "under-review", label: "Under Review by Evaluator", date: "Jan 10, 2025", icon: <FileSearch className="h-5 w-5" />, done: true },
  { status: "evaluated", label: "Evaluation Completed", date: "Jan 15, 2025", icon: <CheckCircle className="h-5 w-5" />, done: true },
  { status: "feedback", label: "Feedback Available", date: "Jan 18, 2025", icon: <Clock className="h-5 w-5" />, done: true },
]

export function EvaluationStatusPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Evaluation Status</h2>
        <p className="text-sm text-muted-foreground">Track the progress of your performance evaluation</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-display text-base">Academic Year 2024-25</CardTitle>
            <Badge className="bg-accent/15 text-accent hover:bg-accent/20 border-0">Completed</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      step.done
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`h-12 w-0.5 ${step.done ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
                <div className="flex flex-col pb-8 pt-2">
                  <span className="text-sm font-medium text-foreground">{step.label}</span>
                  <span className="text-xs text-muted-foreground">{step.date}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Past evaluations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Past Evaluations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {[
              { year: "2023-24", score: 85, status: "Completed" },
              { year: "2022-23", score: 82, status: "Completed" },
              { year: "2021-22", score: 79, status: "Completed" },
            ].map((ev) => (
              <div key={ev.year} className="flex items-center justify-between rounded-xl border border-border p-4">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{ev.year}</span>
                  <span className="text-xs text-muted-foreground">{ev.status}</span>
                </div>
                <span className="font-display text-xl font-bold text-primary">{ev.score}/100</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
