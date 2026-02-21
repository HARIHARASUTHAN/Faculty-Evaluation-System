"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    getEvaluationCycles, addEvaluationCycle, updateEvaluationCycle,
    type EvaluationCycle
} from "@/lib/firestore"
import { useAuth } from "@/lib/auth-context"
import { CalendarClock, Plus, Loader2, Lock, Unlock, Play, Pause } from "lucide-react"
import { toast } from "sonner"

export function EvaluationCyclesPage() {
    const { user } = useAuth()
    const [cycles, setCycles] = useState<EvaluationCycle[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdd, setShowAdd] = useState(false)
    const [form, setForm] = useState({ academicYear: "", startDate: "", endDate: "" })
    const [adding, setAdding] = useState(false)

    async function load() {
        try {
            const data = await getEvaluationCycles()
            setCycles(data.sort((a, b) => b.academicYear.localeCompare(a.academicYear)))
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    async function handleAdd() {
        if (!form.academicYear || !form.startDate || !form.endDate) {
            toast.error("All fields required"); return
        }
        setAdding(true)
        try {
            await addEvaluationCycle({
                academicYear: form.academicYear,
                startDate: form.startDate,
                endDate: form.endDate,
                status: "inactive",
                createdBy: user?.uid || "",
            })
            toast.success("Evaluation cycle created!")
            setShowAdd(false)
            setForm({ academicYear: "", startDate: "", endDate: "" })
            await load()
        } catch { toast.error("Failed to create cycle") }
        setAdding(false)
    }

    async function handleStatusChange(id: string, newStatus: "active" | "locked" | "inactive") {
        try {
            // If activating, deactivate all others first
            if (newStatus === "active") {
                for (const c of cycles) {
                    if (c.status === "active" && c.id !== id) {
                        await updateEvaluationCycle(c.id, { status: "inactive" })
                    }
                }
            }
            await updateEvaluationCycle(id, { status: newStatus })
            toast.success(`Cycle ${newStatus === "active" ? "activated" : newStatus === "locked" ? "locked" : "deactivated"}`)
            await load()
        } catch { toast.error("Failed to update status") }
    }

    const statusColor = (s: string) => {
        if (s === "active") return "bg-accent/15 text-accent border-accent/20"
        if (s === "locked") return "bg-destructive/15 text-destructive border-destructive/20"
        return "bg-secondary/50 text-muted-foreground border-border"
    }

    if (loading) {
        return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-24 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Evaluation Cycles</h2>
                    <p className="text-sm text-muted-foreground mt-1">Activate, lock, or manage academic year evaluation cycles</p>
                </div>
                <Button onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
                    <Plus className="h-4 w-4 mr-1" /> New Cycle
                </Button>
            </div>

            {showAdd && (
                <Card className="glass-card border-primary/20 animate-fade-in-up">
                    <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <Label className="text-xs text-muted-foreground">Academic Year</Label>
                                <Input value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} className="bg-secondary/50 border-border mt-1" placeholder="2025-2026" />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">Start Date</Label>
                                <Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="bg-secondary/50 border-border mt-1" />
                            </div>
                            <div>
                                <Label className="text-xs text-muted-foreground">End Date</Label>
                                <Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} className="bg-secondary/50 border-border mt-1" />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                            <Button onClick={handleAdd} disabled={adding} className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
                                {adding && <Loader2 className="h-4 w-4 animate-spin mr-1" />} Create
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {cycles.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <CalendarClock className="h-14 w-14 mb-3 opacity-20" />
                    <p>No evaluation cycles created yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {cycles.map((cycle, i) => (
                        <Card key={cycle.id} className={`glass-card border-border/50 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                            <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${cycle.status === "active" ? "bg-accent/10" : cycle.status === "locked" ? "bg-destructive/10" : "bg-secondary/50"}`}>
                                        {cycle.status === "locked" ? <Lock className="h-5 w-5 text-destructive" /> : <CalendarClock className="h-5 w-5 text-primary" />}
                                    </div>
                                    <div>
                                        <p className="font-display text-lg font-bold text-foreground">{cycle.academicYear}</p>
                                        <p className="text-xs text-muted-foreground">{cycle.startDate} → {cycle.endDate}</p>
                                    </div>
                                    <Badge className={statusColor(cycle.status)}>
                                        {cycle.status === "active" ? "Active" : cycle.status === "locked" ? "Locked" : "Inactive"}
                                    </Badge>
                                </div>
                                <div className="flex gap-2">
                                    {cycle.status !== "active" && cycle.status !== "locked" && (
                                        <Button size="sm" onClick={() => handleStatusChange(cycle.id, "active")} className="bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20">
                                            <Play className="h-3.5 w-3.5 mr-1" /> Activate
                                        </Button>
                                    )}
                                    {cycle.status === "active" && (
                                        <>
                                            <Button size="sm" onClick={() => handleStatusChange(cycle.id, "inactive")} variant="ghost" className="text-muted-foreground">
                                                <Pause className="h-3.5 w-3.5 mr-1" /> Deactivate
                                            </Button>
                                            <Button size="sm" onClick={() => handleStatusChange(cycle.id, "locked")} className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20">
                                                <Lock className="h-3.5 w-3.5 mr-1" /> Lock
                                            </Button>
                                        </>
                                    )}
                                    {cycle.status === "locked" && (
                                        <Button size="sm" onClick={() => handleStatusChange(cycle.id, "inactive")} variant="ghost" className="text-muted-foreground">
                                            <Unlock className="h-3.5 w-3.5 mr-1" /> Unlock
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
