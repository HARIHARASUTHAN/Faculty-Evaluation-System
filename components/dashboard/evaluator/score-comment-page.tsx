"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { evaluationCriteria, faculty } from "@/lib/dummy-data"
import { Save } from "lucide-react"

const assignedFaculty = faculty.filter(
  (f) =>
    (f.department === "Computer Science" || f.department === "Civil Engineering") &&
    f.evaluationStatus !== "evaluated"
)

export function ScoreCommentPage() {
  const [selectedFaculty, setSelectedFaculty] = useState("")
  const [scores, setScores] = useState<Record<string, number[]>>(
    Object.fromEntries(evaluationCriteria.map((c) => [c.id, [80]]))
  )

  const totalWeighted = evaluationCriteria.reduce((sum, c) => {
    return sum + ((scores[c.id]?.[0] ?? 0) * c.weightage) / 100
  }, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Score & Comment</h2>
        <p className="text-sm text-muted-foreground">Assign scores and provide feedback for faculty submissions</p>
      </div>

      {/* Faculty selector */}
      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col gap-2">
            <Label>Select Faculty to Evaluate</Label>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Choose a faculty member" />
              </SelectTrigger>
              <SelectContent>
                {assignedFaculty.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name} - {f.department}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedFaculty && (
        <>
          {/* Scoring sliders */}
          <div className="flex flex-col gap-4">
            {evaluationCriteria.map((c) => (
              <Card key={c.id} className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{c.name}</h4>
                      <p className="text-xs text-muted-foreground">Weightage: {c.weightage}%</p>
                    </div>
                    <span className="font-display text-xl font-bold text-primary">
                      {scores[c.id]?.[0]}
                    </span>
                  </div>
                  <Slider
                    value={scores[c.id]}
                    onValueChange={(v) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                    max={100}
                    min={0}
                    step={1}
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Weighted score summary */}
          <Card className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <span className="font-medium text-foreground">Weighted Overall Score</span>
              <span className="font-display text-3xl font-bold text-primary">
                {totalWeighted.toFixed(1)}
              </span>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-base">Evaluator Comments</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label>Overall Feedback</Label>
                <Textarea
                  placeholder="Provide detailed feedback on the faculty member's performance..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Areas of Improvement</Label>
                <Textarea
                  placeholder="Suggest areas where the faculty member can improve..."
                  className="min-h-[80px]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Strengths</Label>
                <Textarea
                  placeholder="Highlight key strengths and achievements..."
                  className="min-h-[80px]"
                />
              </div>
              <Button className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" />
                Save Scores & Comments
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
