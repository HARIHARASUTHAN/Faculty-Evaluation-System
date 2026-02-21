"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth-context"
import { getEvaluationsByEvaluator, getCriteria, updateEvaluation, type Evaluation, type Criteria } from "@/lib/firestore"
import { Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ScoreCommentPage() {
  const { user } = useAuth()
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvalId, setSelectedEvalId] = useState("")
  const [scores, setScores] = useState<Record<string, number[]>>({})
  const [comments, setComments] = useState("")
  const [strengths, setStrengths] = useState("")
  const [improvements, setImprovements] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    async function fetchData() {
      try {
        const [evals, crit] = await Promise.all([getEvaluationsByEvaluator(user!.uid), getCriteria()])
        const pending = evals.filter(e => e.status !== "evaluated")
        setEvaluations(pending)
        setCriteria(crit)
        setScores(Object.fromEntries(crit.map(c => [c.id, [80]])))
      } catch { console.error("Failed") } finally { setLoading(false) }
    }
    fetchData()
  }, [user])

  const totalWeighted = criteria.reduce((sum, c) => sum + ((scores[c.id]?.[0] ?? 0) * c.weightage) / 100, 0)

  async function handleSave() {
    if (!selectedEvalId) return
    setSaving(true)
    try {
      const scoreMap: Record<string, number> = {}
      criteria.forEach(c => { scoreMap[c.id] = scores[c.id]?.[0] ?? 0 })
      await updateEvaluation(selectedEvalId, {
        scores: scoreMap,
        finalScore: Math.round(totalWeighted),
        comments: `${comments}\n\nStrengths: ${strengths}\n\nAreas of Improvement: ${improvements}`.trim(),
        status: "under-review",
      })
      toast.success("Scores and comments saved!")
    } catch { toast.error("Failed to save") } finally { setSaving(false) }
  }

  if (loading) return <div className="flex flex-col gap-4">{[1, 2, 3].map(i => <div key={i} className="h-32 skeleton-shimmer rounded-xl" />)}</div>

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Score & Comment</h2>
        <p className="text-sm text-muted-foreground">Assign scores and provide feedback for faculty submissions</p>
      </div>

      <Card className="premium-card border-border bg-card">
        <CardContent className="p-5">
          <div className="flex flex-col gap-2">
            <Label>Select Faculty to Evaluate</Label>
            <Select value={selectedEvalId} onValueChange={setSelectedEvalId}>
              <SelectTrigger className="w-full sm:w-80 bg-secondary/50"><SelectValue placeholder="Choose a faculty member" /></SelectTrigger>
              <SelectContent>
                {evaluations.map(ev => (<SelectItem key={ev.id} value={ev.id}>{ev.facultyName} — {ev.department}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedEvalId && (
        <>
          <div className="flex flex-col gap-4">
            {criteria.map((c, i) => (
              <Card key={c.id} className={`premium-card border-border bg-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <div><h4 className="text-sm font-medium text-foreground">{c.title}</h4><p className="text-xs text-muted-foreground">Weightage: {c.weightage}%</p></div>
                    <span className="font-display text-xl font-bold gradient-text">{scores[c.id]?.[0]}</span>
                  </div>
                  <Slider value={scores[c.id]} onValueChange={v => setScores(prev => ({ ...prev, [c.id]: v }))} max={100} min={0} step={1} />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="premium-card border-border bg-card">
            <CardContent className="flex items-center justify-between p-5">
              <span className="font-medium text-foreground">Weighted Overall Score</span>
              <span className="font-display text-4xl font-bold gradient-text">{totalWeighted.toFixed(1)}</span>
            </CardContent>
          </Card>

          <Card className="premium-card border-border bg-card">
            <CardHeader><CardTitle className="font-display text-base">Evaluator Comments</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label>Overall Feedback</Label><Textarea placeholder="Provide detailed feedback..." className="min-h-[100px] bg-secondary/30" value={comments} onChange={e => setComments(e.target.value)} /></div>
              <div className="flex flex-col gap-2"><Label>Strengths</Label><Textarea placeholder="Highlight key strengths..." className="min-h-[80px] bg-secondary/30" value={strengths} onChange={e => setStrengths(e.target.value)} /></div>
              <div className="flex flex-col gap-2"><Label>Areas of Improvement</Label><Textarea placeholder="Suggest areas for improvement..." className="min-h-[80px] bg-secondary/30" value={improvements} onChange={e => setImprovements(e.target.value)} /></div>
              <Button className="w-fit bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90" onClick={handleSave} disabled={saving}>
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Scores & Comments</>}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
