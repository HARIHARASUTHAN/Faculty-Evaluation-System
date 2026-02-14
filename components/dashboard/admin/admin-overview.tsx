"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Building2, FileText, TrendingUp } from "lucide-react"
import { departmentStats, yearlyTrends } from "@/lib/dummy-data"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const stats = [
  { label: "Total Faculty", value: "62", icon: <Users className="h-5 w-5" />, change: "+4 this year" },
  { label: "Departments", value: "5", icon: <Building2 className="h-5 w-5" />, change: "Active" },
  { label: "Evaluations Done", value: "47", icon: <FileText className="h-5 w-5" />, change: "76% complete" },
  { label: "Avg Score", value: "85.4", icon: <TrendingUp className="h-5 w-5" />, change: "+2.4 from last year" },
]

export function AdminOverview() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats cards */}
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
                <span className="text-xs text-accent">{stat.change}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Department-wise Average Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="department"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => v.split(" ")[0]}
                  stroke="hsl(var(--muted-foreground))"
                />
                <YAxis domain={[60, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Yearly Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[70, 100]} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="avgScore"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--accent))", strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent evaluations */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Evaluation Progress by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {departmentStats.map((dept) => {
              const progress = Math.round((dept.evaluated / dept.facultyCount) * 100)
              return (
                <div key={dept.department} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{dept.department}</span>
                    <span className="text-muted-foreground">
                      {dept.evaluated}/{dept.facultyCount} evaluated ({progress}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
