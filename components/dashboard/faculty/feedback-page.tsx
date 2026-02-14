"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { evaluationCriteria } from "@/lib/dummy-data"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const feedbackData = evaluationCriteria.map((c) => ({
  name: c.name.split(" ")[0],
  selfScore: Math.floor(Math.random() * 15) + 75,
  evaluatorScore: Math.floor(Math.random() * 15) + 78,
}))

export function FeedbackPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">View Feedback</h2>
        <p className="text-sm text-muted-foreground">Feedback from your evaluator for the academic year 2024-25</p>
      </div>

      {/* Overall feedback card */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-muted-foreground">Overall Performance Score</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-primary">87</span>
                <span className="text-lg text-muted-foreground">/100</span>
              </div>
            </div>
            <Badge className="w-fit bg-accent/15 text-accent hover:bg-accent/20 border-0 text-sm px-4 py-1.5">
              Excellent Performance
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Score comparison chart */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Self Score vs Evaluator Score</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={feedbackData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[60, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar dataKey="selfScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Self Score" />
              <Bar dataKey="evaluatorScore" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} name="Evaluator Score" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Evaluator comments */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Evaluator Comments</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Dr. Anand Patel (HOD)</p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Excellent teaching skills with consistent research output. Dr. Sharma has shown remarkable
              improvement in publications this academic year with 3 journal papers and 2 conference proceedings.
              Student feedback has been consistently positive. I recommend continuing the current research
              direction and exploring funded project opportunities.
            </p>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="mb-2 text-sm font-medium text-foreground">Areas of Improvement</p>
            <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                Consider applying for more funded research projects
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                Increase industry collaboration and MoU activities
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-chart-3" />
                Mentor more Ph.D. scholars for enhanced research output
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
