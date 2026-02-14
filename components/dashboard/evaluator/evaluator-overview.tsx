"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { Users, ClipboardCheck, Clock, CheckCircle } from "lucide-react"
import { evaluations } from "@/lib/dummy-data"

export function EvaluatorOverview() {
  const { user } = useAuth()

  const myEvals = evaluations.filter((e) => e.evaluatorId === "u3")
  const pending = myEvals.filter((e) => e.status === "submitted" || e.status === "under-review")
  const completed = myEvals.filter((e) => e.status === "evaluated")

  const stats = [
    { label: "Assigned Faculty", value: myEvals.length.toString(), icon: <Users className="h-5 w-5" /> },
    { label: "Pending Reviews", value: pending.length.toString(), icon: <Clock className="h-5 w-5" /> },
    { label: "Completed", value: completed.length.toString(), icon: <CheckCircle className="h-5 w-5" /> },
    { label: "Avg Score Given", value: "88", icon: <ClipboardCheck className="h-5 w-5" /> },
  ]

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h2 className="font-display text-xl font-bold text-foreground">
            Welcome, {user?.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Evaluator - Department of {user?.department ?? "Computer Science"} | Academic Year 2024-25
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="font-display text-2xl font-bold text-foreground">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent activity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {myEvals.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center justify-between rounded-xl border border-border p-4"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">{ev.facultyName}</span>
                  <span className="text-xs text-muted-foreground">{ev.department}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden font-display text-lg font-bold text-primary sm:block">
                    {ev.overallScore}
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      ev.status === "evaluated"
                        ? "border-accent text-accent"
                        : ev.status === "submitted"
                        ? "border-primary text-primary"
                        : "border-chart-3 text-chart-3"
                    }
                  >
                    {ev.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
