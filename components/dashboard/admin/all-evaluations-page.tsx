"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { evaluations, departments } from "@/lib/dummy-data"
import { Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function AllEvaluationsPage() {
  const [search, setSearch] = useState("")
  const [filterDept, setFilterDept] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedEval, setSelectedEval] = useState<(typeof evaluations)[0] | null>(null)

  const filtered = evaluations.filter((e) => {
    const matchSearch = e.facultyName.toLowerCase().includes(search.toLowerCase())
    const matchDept = filterDept === "all" || e.department === filterDept
    const matchStatus = filterStatus === "all" || e.status === filterStatus
    return matchSearch && matchDept && matchStatus
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">All Evaluations</h2>
        <p className="text-sm text-muted-foreground">View and track all faculty evaluations</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by faculty name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under-review">Under Review</SelectItem>
            <SelectItem value="evaluated">Evaluated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Evaluations ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Faculty</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Evaluator</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium text-foreground">{ev.facultyName}</TableCell>
                    <TableCell className="text-muted-foreground">{ev.department}</TableCell>
                    <TableCell className="text-muted-foreground">{ev.evaluatorName}</TableCell>
                    <TableCell className="text-muted-foreground">{ev.academicYear}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          ev.status === "evaluated"
                            ? "border-accent text-accent"
                            : ev.status === "submitted"
                            ? "border-primary text-primary"
                            : ev.status === "under-review"
                            ? "border-chart-3 text-chart-3"
                            : "border-muted-foreground text-muted-foreground"
                        }
                      >
                        {ev.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium text-foreground">
                      {ev.overallScore}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedEval(ev)}
                        aria-label="View evaluation details"
                      >
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

      {/* Detail dialog */}
      <Dialog open={!!selectedEval} onOpenChange={() => setSelectedEval(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Evaluation Details</DialogTitle>
          </DialogHeader>
          {selectedEval && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Faculty</p>
                  <p className="font-medium text-foreground">{selectedEval.facultyName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">{selectedEval.department}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Evaluator</p>
                  <p className="font-medium text-foreground">{selectedEval.evaluatorName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Academic Year</p>
                  <p className="font-medium text-foreground">{selectedEval.academicYear}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <p className="mb-2 text-sm font-medium text-foreground">Comments</p>
                <p className="text-sm text-muted-foreground">{selectedEval.comments}</p>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
                <span className="font-medium text-foreground">Overall Score</span>
                <span className="font-display text-2xl font-bold text-primary">{selectedEval.overallScore}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
