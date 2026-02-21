"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { getCriteria, addSelfEvaluation, type Criteria } from "@/lib/firestore"
import { useAuth } from "@/lib/auth-context"
import { Send, Save, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function SelfEvaluationPage() {
  const { user } = useAuth()
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [scores, setScores] = useState<Record<string, number[]>>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    async function fetchCriteria() {
      try {
        const data = await getCriteria()
        setCriteria(data)
        setScores(Object.fromEntries(data.map((c) => [c.id, [75]])))
        setComments(Object.fromEntries(data.map((c) => [c.id, ""])))
      } catch { toast.error("Failed to load criteria") } finally { setLoading(false) }
    }
    fetchCriteria()
  }, [])

  async function handleSubmit() {
    if (!user) return
    setSaving(true)
    try {
      const answers = Object.fromEntries(criteria.map(c => [c.id, { score: scores[c.id]?.[0] || 0, comment: comments[c.id] || "" }]))
      await addSelfEvaluation({
        facultyId: user.uid,
        academicYear: "2024-25",
        answers,
        documents: [],
        status: "submitted",
      })
      setSubmitted(true)
      toast.success("Self evaluation submitted successfully!")
    } catch { toast.error("Failed to submit evaluation") } finally { setSaving(false) }
  }

  if (loading) return <div className="flex flex-col gap-4">{[1, 2, 3].map(i => <div key={i} className="h-40 skeleton-shimmer rounded-xl" />)}</div>

  if (submitted) {
    return (
      <div className="flex flex-col gap-6">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-5 p-14 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 animate-count-up">
              <CheckCircle className="h-10 w-10 text-accent" />
            </div>
            <h3 className="font-display text-2xl font-bold text-foreground">Evaluation Submitted!</h3>
            <p className="max-w-md text-sm text-muted-foreground">
              Your self-evaluation has been submitted successfully. Your evaluator will review it and provide feedback.
            </p>
            <Button onClick={() => setSubmitted(false)} variant="outline" className="bg-transparent hover:bg-secondary">
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

      {criteria.length === 0 ? (
        <Card className="border-border bg-card"><CardContent className="py-12 text-center text-muted-foreground">No criteria defined yet. Contact your administrator.</CardContent></Card>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {criteria.map((c, i) => (
              <Card key={c.id} className={`premium-card border-border bg-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="font-display text-base">{c.title}</CardTitle>
                    <span className="font-display text-xl font-bold gradient-text">{scores[c.id]?.[0]}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{c.description} (Weightage: {c.weightage}%)</p>
                </CardHeader>
                <CardContent>
                  <Slider value={scores[c.id]} onValueChange={(v) => setScores(prev => ({ ...prev, [c.id]: v }))} max={100} min={0} step={1} />
                  <div className="mt-3 flex flex-col gap-2">
                    <Label className="text-xs text-muted-foreground">Additional comments</Label>
                    <Textarea
                      placeholder="Describe your achievements and contributions..."
                      className="min-h-[60px] bg-secondary/30"
                      value={comments[c.id] || ""}
                      onChange={(e) => setComments(prev => ({ ...prev, [c.id]: e.target.value }))}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" className="bg-transparent hover:bg-secondary">
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4" /> Submit Evaluation</>}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
