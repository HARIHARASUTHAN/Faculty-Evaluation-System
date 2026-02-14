"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { departments, faculty } from "@/lib/dummy-data"
import { UserCheck } from "lucide-react"

const evaluators = [
  { id: "u3", name: "Dr. Anand Patel", department: "Computer Science", assignedCount: 4 },
  { id: "u5", name: "Dr. Vikram Singh", department: "Mechanical", assignedCount: 3 },
]

export function AssignEvaluatorsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Assign Evaluators</h2>
        <p className="text-sm text-muted-foreground">Assign HODs and Principals to evaluate faculty members</p>
      </div>

      {/* Current evaluators */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Current Evaluators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {evaluators.map((ev) => (
              <div
                key={ev.id}
                className="flex items-center gap-4 rounded-xl border border-border p-4"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{ev.name}</p>
                  <p className="text-sm text-muted-foreground">{ev.department}</p>
                </div>
                <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0">
                  {ev.assignedCount} assigned
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment table */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Faculty Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assigned Evaluator</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {faculty.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                    <TableCell className="text-muted-foreground">{f.department}</TableCell>
                    <TableCell>
                      <Select defaultValue="u3">
                        <SelectTrigger className="w-52">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {evaluators.map((ev) => (
                            <SelectItem key={ev.id} value={ev.id}>
                              {ev.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        Update
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
