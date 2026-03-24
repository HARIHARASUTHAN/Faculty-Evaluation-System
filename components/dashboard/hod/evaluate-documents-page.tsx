"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import {
    getDocumentsByDepartment, addDocumentEvaluation, getDocumentEvaluations, addAuditLog,
    deleteDocumentAndEvaluations,
    KPI_CATEGORIES, CATEGORY_TARGETS, getMaxScore,
    type FacultyDocument, type DocumentEvaluation
} from "@/lib/firestore"
import { Star, FileText, Loader2, CheckCircle, Info, Download, Eye, Trash2 } from "lucide-react"
import { toast } from "sonner"




/** Helper to force download for Cloudinary URLs */
function getDownloadUrl(url: string) {
    if (!url) return ""
    if (url.includes("cloudinary.com") && url.includes("/upload/")) {
        return url.replace("/upload/", "/upload/fl_attachment/")
    }
    return url
}

export function EvaluateDocumentsPage() {
    const { user } = useAuth()
    const [docs, setDocs] = useState<FacultyDocument[]>([])
    const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [selectedDoc, setSelectedDoc] = useState<FacultyDocument | null>(null)
    const [score, setScore] = useState<number | null>(null)
    const [remarks, setRemarks] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const maxScore = selectedDoc ? getMaxScore(selectedDoc.category) : 5

    async function load() {
        if (!user?.departmentId) { setLoading(false); return }
        try {
            const allDocs = await getDocumentsByDepartment(user.departmentId)
            const approvedDocs = allDocs.filter(d => d.status === "approved")
            setDocs(approvedDocs)

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

    function handleSelectDoc(doc: FacultyDocument) {
        setSelectedDoc(doc)
        setScore(null)
        setRemarks("")
    }

    function handleScoreChange(e: React.ChangeEvent<HTMLInputElement>) {
        const raw = e.target.value
        if (raw === "") {
            setScore(null)
            return
        }
        const val = parseFloat(raw)
        if (isNaN(val)) return
        const clamped = Math.max(0, Math.min(val, maxScore))
        setScore(clamped)
    }

    async function handleSubmit() {
        if (!selectedDoc || !user || score === null) return
        if (score < 1 || score > maxScore) {
            toast.error(`Score must be between 1 and ${maxScore}`)
            return
        }
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
                details: `Scored "${selectedDoc.originalName}" from ${selectedDoc.facultyName}: ${score ?? 0}/${maxScore}`,
                timestamp: new Date().toISOString(),
            })
            toast.success(`Score ${score ?? 0}/${maxScore} submitted!`)
            setSelectedDoc(null)
            setScore(null)
            setRemarks("")
            await load()
        } catch { toast.error("Failed to submit score") }
        setSubmitting(false)
    }

    async function handleDeleteDoc(doc: FacultyDocument) {
        if (!window.confirm(`Are you sure you want to delete "${doc.originalName}"? This will also remove any scores awarded for it.`)) return
        try {
            await deleteDocumentAndEvaluations(doc.id)
            await addAuditLog({
                userId: user?.uid || "", userName: user?.name || "",
                action: "Document Deleted",
                details: `Deleted "${doc.originalName}" by ${doc.facultyName}`,
                timestamp: new Date().toISOString(),
            })
            toast.success("Document and associated score removed")
            await load()
        } catch { toast.error("Failed to delete document") }
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
                <p className="text-sm text-muted-foreground mt-1">Score approved documents based on category weightage</p>
            </div>

            {/* Scoring dialog */}
            {selectedDoc && (
                <Card className="glass-card border-primary/20 animate-fade-in-up">
                    <CardContent className="p-6 space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-display text-lg font-bold text-foreground">Score Document</p>
                                <p className="text-sm text-muted-foreground">{selectedDoc.originalName} — by {selectedDoc.facultyName}</p>
                                <p className="text-xs text-muted-foreground">Category: {selectedDoc.categoryName} (Max Score: {maxScore})</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-300"
                            >
                                <a href={selectedDoc.filePath} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Document
                                </a>
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Score (1–{maxScore})</Label>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    min={1}
                                    max={maxScore}
                                    step="any"
                                    value={score === null ? "" : score}
                                    onChange={handleScoreChange}
                                    className="bg-secondary/50 border-border h-11 w-32 text-lg font-bold text-center"
                                    placeholder="0"
                                />
                                <span className="text-sm text-muted-foreground">/ {maxScore}</span>
                            </div>
                            {score !== null && (score < 1 || score > maxScore) && (
                                <p className="text-xs text-destructive">Score must be between 1 and {maxScore}</p>
                            )}
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
                            <Button onClick={handleSubmit} disabled={submitting || score === null || score < 1 || score > maxScore} className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
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
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Pending Scoring</p>
                    <div className="space-y-3">
                        {unevaluated.map(doc => {
                            const docMax = getMaxScore(doc.category)
                            return (
                                <Card key={doc.id} className="glass-card border-border/50">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                                                <FileText className="h-5 w-5 text-amber-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{doc.originalName}</p>
                                                <p className="text-xs text-muted-foreground">{doc.facultyName} • {doc.categoryName} <span className="text-foreground/50">({docMax} pts)</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={selectedDoc?.id === doc.id ? selectedDoc.filePath : doc.filePath}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 text-indigo-600 hover:bg-secondary hover:text-indigo-700 transition-colors"
                                                title="View Document"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </a>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDeleteDoc(doc)}
                                                className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                title="Delete Document"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" onClick={() => handleSelectDoc(doc)} className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200">
                                                <Star className="h-3.5 w-3.5 mr-1" /> Score
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                </>
            )}

            {/* Already scored */}
            {evaluated.length > 0 && (
                <>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-6">Already Scored</p>
                    
                    {Object.entries(
                        evaluated.reduce((acc, doc) => {
                            const cat = doc.categoryName || "Uncategorized"
                            if (!acc[cat]) acc[cat] = []
                            acc[cat].push(doc)
                            return acc
                        }, {} as Record<string, FacultyDocument[]>)
                    ).map(([category, categoryDocs]) => (
                        <div key={category} className="space-y-3 mt-4 first:mt-2">
                            <h3 className="text-sm font-semibold text-indigo-900/80 flex items-center gap-2">
                                <div className="h-1 w-1 rounded-full bg-indigo-500" />
                                {category}
                            </h3>
                            <div className="space-y-2">
                                {categoryDocs.map(doc => (
                                    <Card key={doc.id} className="glass-card border-border/50">
                                        <CardContent className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                                                    <CheckCircle className="h-5 w-5 text-accent" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{doc.originalName}</p>
                                                    <p className="text-xs text-muted-foreground">{doc.facultyName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={doc.filePath}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/50 text-indigo-600 hover:bg-secondary hover:text-indigo-700 transition-colors"
                                                    title="View Document"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </a>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteDoc(doc)}
                                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                                    title="Delete Document"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <span className="text-xs text-accent font-medium">Scored ✓</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    ))}
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
