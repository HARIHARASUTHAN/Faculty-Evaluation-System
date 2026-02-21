"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCriteria, addCriteria, deleteCriteria, type Criteria } from "@/lib/firestore"
import { Plus, Pencil, Trash2, ClipboardList, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function EvaluationCriteriaPage() {
  const [criteria, setCriteria] = useState<Criteria[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [weightage, setWeightage] = useState([20])
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>("")

  useEffect(() => { fetchCriteria() }, [])

  async function fetchCriteria() {
    try { const data = await getCriteria(); setCriteria(data) } catch { toast.error("Failed to load criteria") } finally { setLoading(false) }
  }

  const totalWeight = criteria.reduce((sum, c) => sum + c.weightage, 0)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !category) return
    setSaving(true)
    try {
      await addCriteria({ title: title.trim(), description: description.trim(), weightage: weightage[0], category: category as Criteria["category"] })
      toast.success("Criteria created!")
      setTitle(""); setDescription(""); setCategory(""); setWeightage([20]); setOpen(false)
      fetchCriteria()
    } catch { toast.error("Failed to create criteria") } finally { setSaving(false) }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete criteria "${name}"?`)) return
    try { await deleteCriteria(id); toast.success("Criteria deleted"); fetchCriteria() } catch { toast.error("Failed to delete") }
  }

  if (loading) return <div className="flex flex-col gap-6"><div className="h-12 skeleton-shimmer rounded-xl" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-44 skeleton-shimmer rounded-xl" />)}</div></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Evaluation Criteria</h2>
          <p className="text-sm text-muted-foreground">Define criteria and assign weightage (Total: <span className={totalWeight === 100 ? "text-accent" : "text-chart-3"}>{totalWeight}%</span>)</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90"><Plus className="mr-2 h-4 w-4" /> Add Criteria</Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-border">
            <DialogHeader><DialogTitle className="font-display">Add New Criteria</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label>Criteria Name</Label><Input placeholder="e.g. Community Service" value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50" required /></div>
              <div className="flex flex-col gap-2"><Label>Description</Label><Textarea placeholder="Describe this criteria..." value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary/50" /></div>
              <div className="flex flex-col gap-2"><Label>Category</Label>
                <Select value={category} onValueChange={setCategory}><SelectTrigger className="bg-secondary/50"><SelectValue placeholder="Select category" /></SelectTrigger><SelectContent><SelectItem value="Teaching">Teaching</SelectItem><SelectItem value="Research">Research</SelectItem><SelectItem value="Academic">Academic</SelectItem><SelectItem value="General">General</SelectItem></SelectContent></Select>
              </div>
              <div className="flex flex-col gap-2"><Label>Weightage: {weightage[0]}%</Label><Slider value={weightage} onValueChange={setWeightage} max={50} min={5} step={5} className="mt-2" /></div>
              <Button type="submit" className="bg-gradient-to-r from-primary to-blue-500 text-primary-foreground hover:opacity-90" disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</> : "Add Criteria"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {criteria.length === 0 ? (
        <Card className="border-border bg-card"><CardContent className="flex flex-col items-center gap-3 py-12"><ClipboardList className="h-10 w-10 text-muted-foreground/40" /><p className="text-muted-foreground">No criteria defined yet.</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {criteria.map((c, i) => (
            <Card key={c.id} className={`premium-card border-border bg-card animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex flex-col gap-1.5">
                  <CardTitle className="font-display text-base">{c.title}</CardTitle>
                  <Badge variant="outline" className="w-fit text-xs">{c.category}</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-secondary"><Pencil className="h-3.5 w-3.5 text-muted-foreground" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/10" onClick={() => handleDelete(c.id, c.title)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">{c.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Weightage</span>
                  <span className="font-display text-lg font-bold gradient-text">{c.weightage}%</span>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all" style={{ width: `${(c.weightage / 50) * 100}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
