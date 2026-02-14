"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { evaluationCriteria } from "@/lib/dummy-data"
import { Send, Save } from "lucide-react"

export function SelfEvaluationPage() {
  const [scores, setScores] = useState<Record<string, number[]>>(
    Object.fromEntries(evaluationCriteria.map((c) => [c.id, [75]]))
  )
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-4 p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15">
              <Send className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground">Self Evaluation Submitted</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Your self-evaluation has been submitted successfully. Your HOD will review it and provide feedback.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline">
              Edit Submission
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Self Evaluation</h2>
        <p className="text-sm text-muted-foreground">Rate yourself on each criterion for the academic year 2024-25</p>
      </div>

      <div className="flex flex-col gap-4">
        {evaluationCriteria.map((c) => (
          <Card key={c.id} className="border-border bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-display text-base">{c.name}</CardTitle>
                <span className="font-display text-lg font-bold text-primary">{scores[c.id]?.[0]}</span>
              </div>
              <p className="text-sm text-muted-foreground">{c.description} (Weightage: {c.weightage}%)</p>
            </CardHeader>
            <CardContent>
              <Slider
                value={scores[c.id]}
                onValueChange={(v) => setScores((prev) => ({ ...prev, [c.id]: v }))}
                max={100}
                min={0}
                step={1}
              />
              <div className="mt-3 flex flex-col gap-2">
                <Label className="text-xs text-muted-foreground">Additional comments for this section</Label>
                <Textarea placeholder="Describe your achievements and contributions..." className="min-h-[60px]" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button variant="outline">
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setSubmitted(true)}>
          <Send className="mr-2 h-4 w-4" />
          Submit Evaluation
        </Button>
      </div>
    </div>
  )
}
