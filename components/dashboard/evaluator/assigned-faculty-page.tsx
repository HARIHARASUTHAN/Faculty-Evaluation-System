"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { faculty } from "@/lib/dummy-data"
import { Eye } from "lucide-react"

const assignedFaculty = faculty.filter(
  (f) => f.department === "Computer Science" || f.department === "Civil Engineering"
)

export function AssignedFacultyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Assigned Faculty</h2>
        <p className="text-sm text-muted-foreground">Faculty members assigned to you for evaluation</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">
            Faculty List ({assignedFaculty.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Evaluation Status</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedFaculty.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{f.name}</span>
                        <span className="text-xs text-muted-foreground">{f.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{f.department}</TableCell>
                    <TableCell className="text-muted-foreground">{f.designation}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          f.evaluationStatus === "evaluated"
                            ? "border-accent text-accent"
                            : f.evaluationStatus === "submitted"
                            ? "border-primary text-primary"
                            : f.evaluationStatus === "under-review"
                            ? "border-chart-3 text-chart-3"
                            : "border-muted-foreground text-muted-foreground"
                        }
                      >
                        {f.evaluationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-foreground">
                      {f.overallScore ?? "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label="View details">
                        <Eye className="h-4 w-4 text-primary" />
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
