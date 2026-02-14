"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { faculty, departments } from "@/lib/dummy-data"
import { Plus, Pencil, Trash2, Search } from "lucide-react"

export function ManageFacultyPage() {
  const [search, setSearch] = useState("")
  const [filterDept, setFilterDept] = useState("all")
  const [open, setOpen] = useState(false)

  const filtered = faculty.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase()) || f.email.toLowerCase().includes(search.toLowerCase())
    const matchDept = filterDept === "all" || f.department === filterDept
    return matchSearch && matchDept
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Manage Faculty</h2>
          <p className="text-sm text-muted-foreground">View and manage all faculty members</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">Add New Faculty</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setOpen(false)
              }}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fac-name">Full Name</Label>
                  <Input id="fac-name" placeholder="Dr. Jane Doe" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fac-email">Email</Label>
                  <Input id="fac-email" type="email" placeholder="jane@university.edu" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fac-dept">Department</Label>
                  <Select>
                    <SelectTrigger id="fac-dept">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fac-desg">Designation</Label>
                  <Select>
                    <SelectTrigger id="fac-desg">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assistant">Assistant Professor</SelectItem>
                      <SelectItem value="associate">Associate Professor</SelectItem>
                      <SelectItem value="professor">Professor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fac-join">Joining Date</Label>
                <Input id="fac-join" type="date" />
              </div>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Add Faculty Member
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search faculty by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterDept} onValueChange={setFilterDept}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Faculty List ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Evaluation</TableHead>
                  <TableHead className="text-center">Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((f) => (
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
                        variant={f.status === "active" ? "default" : "secondary"}
                        className={
                          f.status === "active"
                            ? "bg-accent/15 text-accent hover:bg-accent/20 border-0"
                            : "bg-muted text-muted-foreground border-0"
                        }
                      >
                        {f.status}
                      </Badge>
                    </TableCell>
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
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" aria-label="Edit">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="Delete">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
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
