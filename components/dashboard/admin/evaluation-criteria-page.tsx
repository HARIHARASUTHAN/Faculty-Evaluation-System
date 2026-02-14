"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { evaluationCriteria } from "@/lib/dummy-data"
import { Plus, Pencil, Trash2 } from "lucide-react"

export function EvaluationCriteriaPage() {
  const [open, setOpen] = useState(false)
  const [weightage, setWeightage] = useState([20])

  const totalWeight = evaluationCriteria.reduce((sum, c) => sum + c.weightage, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Evaluation Criteria</h2>
          <p className="text-sm text-muted-foreground">
            Define criteria and assign weightage for faculty evaluation (Total: {totalWeight}%)
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Criteria
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Add New Criteria</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setOpen(false)
              }}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="crit-name">Criteria Name</Label>
                <Input id="crit-name" placeholder="e.g. Community Service" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="crit-desc">Description</Label>
                <Textarea id="crit-desc" placeholder="Describe this criteria..." />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="crit-cat">Category</Label>
                <Select>
                  <SelectTrigger id="crit-cat">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Teaching">Teaching</SelectItem>
                    <SelectItem value="Research">Research</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                    <SelectItem value="General">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Weightage: {weightage[0]}%</Label>
                <Slider
                  value={weightage}
                  onValueChange={setWeightage}
                  max={50}
                  min={5}
                  step={5}
                  className="mt-2"
                />
              </div>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Add Criteria
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {evaluationCriteria.map((c) => (
          <Card key={c.id} className="border-border bg-card">
            <CardHeader className="flex flex-row items-start justify-between pb-3">
              <div className="flex flex-col gap-1">
                <CardTitle className="font-display text-base">{c.name}</CardTitle>
                <Badge variant="outline" className="w-fit text-xs">
                  {c.category}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit">
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Delete">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{c.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Weightage</span>
                <span className="font-display text-lg font-bold text-primary">{c.weightage}%</span>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${(c.weightage / 50) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
