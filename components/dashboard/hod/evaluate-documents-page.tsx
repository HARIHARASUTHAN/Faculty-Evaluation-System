"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import {
    getDocumentsByDepartment, addDocumentEvaluation, getDocumentEvaluations, addAuditLog,
    type FacultyDocument, type DocumentEvaluation
} from "@/lib/firestore"
import { Star, FileText, Loader2, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function EvaluateDocumentsPage() {
    const { user } = useAuth()
    const [docs, setDocs] = useState<FacultyDocument[]>([])
    const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [selectedDoc, setSelectedDoc] = useState<FacultyDocument | null>(null)
    const [score, setScore] = useState(3)
    const [remarks, setRemarks] = useState("")
    const [submitting, setSubmitting] = useState(false)

    async function load() {
        if (!user?.departmentId) { setLoading(false); return }
        try {
            const allDocs = await getDocumentsByDepartment(user.departmentId)
            const approvedDocs = allDocs.filter(d => d.status === "approved")
            setDocs(approvedDocs)

            // Check which have been evaluated
            const evaluated = new Set<string>()
            for (const doc of approvedDocs) {
                const evals = await getDocumentEvaluations(doc.id)
                if (evals.some(e => e.hodId === user.uid)) {
                    evaluated.add(doc.id)
                }
            }
            setEvaluatedIds(evaluated)
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    useEffect(() => { load() }, [user])

    async function handleSubmit() {
        if (!selectedDoc || !user) return
        setSubmitting(true)
        try {
            await addDocumentEvaluation({
                documentId: selectedDoc.id,
                hodId: user.uid,
                hodName: user.name,
                score,
                remarks,
                evaluatedAt: new Date().toISOString(),
            })
            await addAuditLog({
                userId: user.uid, userName: user.name,
                action: "Document Scored",
                details: `Scored "${selectedDoc.originalName}" from ${selectedDoc.facultyName}: ${score}/5`,
                timestamp: new Date().toISOString(),
            })
            toast.success(`Score ${score}/5 submitted!`)
            setSelectedDoc(null)
            setScore(3)
            setRemarks("")
            await load()
        } catch { toast.error("Failed to submit score") }
        setSubmitting(false)
    }

    const unevaluated = docs.filter(d => !evaluatedIds.has(d.id))
    const evaluated = docs.filter(d => evaluatedIds.has(d.id))

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Evaluate & Score</h2>
                <p className="text-sm text-muted-foreground mt-1">Score approved documents on a 1–5 scale with remarks</p>
            </div>

            {/* Scoring dialog */}
            {selectedDoc && (
                <Card className="glass-card border-primary/20 animate-fade-in-up">
                    <CardContent className="p-6 space-y-5">
                        <div>
                            <p className="font-display text-lg font-bold text-foreground">Score Document</p>
                            <p className="text-sm text-muted-foreground">{selectedDoc.originalName} — by {selectedDoc.facultyName}</p>
                            <p className="text-xs text-muted-foreground">Category: {selectedDoc.categoryName}</p>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Score (1–5)</Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setScore(s)}
                                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-sm font-bold transition-all ${score === s ? "bg-gradient-to-br from-primary to-accent text-white scale-110 shadow-lg shadow-primary/20" : "bg-secondary/50 text-muted-foreground hover:bg-secondary"}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={`h-4 w-4 ${s <= score ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"}`} />
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Remarks</Label>
                            <textarea
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                placeholder="Add your evaluation remarks…"
                                className="w-full h-24 rounded-lg bg-secondary/50 border border-border p-3 text-sm text-foreground resize-none focus:border-primary focus:outline-none"
                            />
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button variant="ghost" onClick={() => setSelectedDoc(null)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={submitting} className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Star className="h-4 w-4 mr-1" />}
                                Submit Score
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Pending scoring */}
            {unevaluated.length > 0 && (
                <>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Pending Scoring ({unevaluated.length})</p>
                    <div className="space-y-3">
                        {unevaluated.map(doc => (
                            <Card key={doc.id} className="glass-card border-border/50">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                                            <FileText className="h-5 w-5 text-amber-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{doc.originalName}</p>
                                            <p className="text-xs text-muted-foreground">{doc.facultyName} • {doc.categoryName}</p>
                                        </div>
                                    </div>
                                    <Button size="sm" onClick={() => { setSelectedDoc(doc); setScore(3); setRemarks("") }} className="bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20">
                                        <Star className="h-3.5 w-3.5 mr-1" /> Score
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {/* Already scored */}
            {evaluated.length > 0 && (
                <>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-6">Already Scored ({evaluated.length})</p>
                    <div className="space-y-2">
                        {evaluated.map(doc => (
                            <Card key={doc.id} className="glass-card border-border/50 opacity-60">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                                            <CheckCircle className="h-5 w-5 text-accent" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{doc.originalName}</p>
                                            <p className="text-xs text-muted-foreground">{doc.facultyName} • {doc.categoryName}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-accent font-medium">Scored ✓</span>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}

            {docs.length === 0 && (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <Star className="h-14 w-14 mb-3 opacity-20" />
                    <p>No approved documents to evaluate</p>
                </div>
            )}
        </div>
    )
}
