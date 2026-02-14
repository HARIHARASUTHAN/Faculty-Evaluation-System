"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { ClipboardCheck, FileText, Star, Clock } from "lucide-react"

export function FacultyOverview() {
  const { user } = useAuth()

  const stats = [
    { label: "Self Evaluation", value: "Submitted", icon: <ClipboardCheck className="h-5 w-5" />, color: "text-accent" },
    { label: "Documents", value: "4 Uploaded", icon: <FileText className="h-5 w-5" />, color: "text-primary" },
    { label: "Overall Score", value: "87/100", icon: <Star className="h-5 w-5" />, color: "text-chart-3" },
    { label: "Status", value: "Evaluated", icon: <Clock className="h-5 w-5" />, color: "text-accent" },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <h2 className="font-display text-xl font-bold text-foreground">
            Welcome back, {user?.name}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Department of {user?.department ?? "Computer Science"} | Academic Year 2024-25
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="font-display text-lg font-bold text-foreground">{stat.value}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Timeline */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Evaluation Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {[
              { step: "Self Evaluation Submitted", date: "Jan 5, 2025", done: true },
              { step: "Documents Uploaded", date: "Jan 8, 2025", done: true },
              { step: "Under Review by HOD", date: "Jan 10, 2025", done: true },
              { step: "Evaluation Completed", date: "Jan 15, 2025", done: true },
              { step: "Feedback Available", date: "Jan 18, 2025", done: true },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                      item.done
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 4 && <div className="mt-1 h-8 w-0.5 bg-border" />}
                </div>
                <div className="flex flex-col pt-1">
                  <span className="text-sm font-medium text-foreground">{item.step}</span>
                  <span className="text-xs text-muted-foreground">{item.date}</span>
                </div>
                {item.done && <Badge className="ml-auto bg-accent/15 text-accent hover:bg-accent/20 border-0">Completed</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
