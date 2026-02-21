"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getFacultyMembers, getAllUsers, type FacultyMember } from "@/lib/firestore"
import { UserCheck } from "lucide-react"
import { toast } from "sonner"

export function AssignEvaluatorsPage() {
  const [faculty, setFaculty] = useState<FacultyMember[]>([])
  const [evaluators, setEvaluators] = useState<Array<{ id: string; name: string; department?: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [fac, users] = await Promise.all([getFacultyMembers(), getAllUsers()])
        setFaculty(fac)
        const evals = users.filter((u: any) => u.role === "evaluator").map((u: any) => ({ id: u.id, name: u.name, department: u.department }))
        setEvaluators(evals)
      } catch { toast.error("Failed to load data") } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  if (loading) return <div className="flex flex-col gap-6"><div className="h-12 skeleton-shimmer rounded-xl" /><div className="h-64 skeleton-shimmer rounded-xl" /></div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Assign Evaluators</h2>
        <p className="text-sm text-muted-foreground">Assign HODs and Principals to evaluate faculty members</p>
      </div>

      {evaluators.length > 0 && (
        <Card className="premium-card border-border bg-card">
          <CardHeader><CardTitle className="font-display text-base">Current Evaluators</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {evaluators.map((ev) => (
                <div key={ev.id} className="flex items-center gap-4 rounded-xl border border-border p-4 premium-card">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl stat-gradient-blue">
                    <UserCheck className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{ev.name}</p>
                    <p className="text-sm text-muted-foreground">{ev.department || "—"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="premium-card border-border bg-card">
        <CardHeader><CardTitle className="font-display text-base">Faculty Assignments</CardTitle></CardHeader>
        <CardContent>
          {faculty.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No faculty members to assign.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead>Faculty</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Assigned Evaluator</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculty.map((f) => (
                    <TableRow key={f.id} className="border-border table-row-hover">
                      <TableCell className="font-medium text-foreground">{f.name}</TableCell>
                      <TableCell className="text-muted-foreground">{f.department}</TableCell>
                      <TableCell>
                        <Select defaultValue={evaluators[0]?.id}>
                          <SelectTrigger className="w-52 bg-secondary/50"><SelectValue /></SelectTrigger>
                          <SelectContent>{evaluators.map((ev) => (<SelectItem key={ev.id} value={ev.id}>{ev.name}</SelectItem>))}</SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90" onClick={() => toast.success("Assignment updated!")}>
                          Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
