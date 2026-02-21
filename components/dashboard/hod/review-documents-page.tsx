"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { getDocumentsByDepartment, updateDocument, addAuditLog, type FacultyDocument } from "@/lib/firestore"
import { FileText, CheckCircle, XCircle, Clock, Eye, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function ReviewDocumentsPage() {
    const { user } = useAuth()
    const [docs, setDocs] = useState<FacultyDocument[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
    const [processing, setProcessing] = useState<string | null>(null)
    const [rejectionReason, setRejectionReason] = useState("")
    const [showRejectFor, setShowRejectFor] = useState<string | null>(null)

    async function load() {
        if (!user?.departmentId) { setLoading(false); return }
        try {
            const data = await getDocumentsByDepartment(user.departmentId)
            setDocs(data)
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    useEffect(() => { load() }, [user])

    async function handleApprove(doc: FacultyDocument) {
        setProcessing(doc.id)
        try {
            await updateDocument(doc.id, { status: "approved" })
            await addAuditLog({
                userId: user!.uid, userName: user!.name,
                action: "Document Approved",
                details: `Approved "${doc.originalName}" from ${doc.facultyName}`,
                timestamp: new Date().toISOString(),
            })
            toast.success("Document approved!")
            await load()
        } catch { toast.error("Failed to approve") }
        setProcessing(null)
    }

    async function handleReject(doc: FacultyDocument) {
        if (!rejectionReason.trim()) { toast.error("Please provide a reason"); return }
        setProcessing(doc.id)
        try {
            await updateDocument(doc.id, { status: "rejected", rejectionReason: rejectionReason.trim() })
            await addAuditLog({
                userId: user!.uid, userName: user!.name,
                action: "Document Rejected",
                details: `Rejected "${doc.originalName}" from ${doc.facultyName}: ${rejectionReason}`,
                timestamp: new Date().toISOString(),
            })
            toast.success("Document rejected")
            setShowRejectFor(null)
            setRejectionReason("")
            await load()
        } catch { toast.error("Failed to reject") }
        setProcessing(null)
    }

    const filtered = docs.filter(d => filter === "all" || d.status === filter)

    const statusBadge = (status: string) => {
        if (status === "approved") return "bg-accent/15 text-accent border-accent/20"
        if (status === "rejected") return "bg-destructive/15 text-destructive border-destructive/20"
        return "bg-amber-500/15 text-amber-400 border-amber-500/20"
    }

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Review Documents</h2>
                <p className="text-sm text-muted-foreground mt-1">Approve or reject faculty document submissions</p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2">
                {(["pending", "approved", "rejected", "all"] as const).map(f => (
                    <Button
                        key={f}
                        size="sm"
                        variant={filter === f ? "default" : "ghost"}
                        onClick={() => setFilter(f)}
                        className={filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground"}
                    >
                        {f === "pending" && <Clock className="h-3.5 w-3.5 mr-1" />}
                        {f === "approved" && <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                        {f === "rejected" && <XCircle className="h-3.5 w-3.5 mr-1" />}
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                        <span className="ml-1 text-xs opacity-70">({docs.filter(d => f === "all" || d.status === f).length})</span>
                    </Button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <FileText className="h-14 w-14 mb-3 opacity-20" />
                    <p>No {filter !== "all" ? filter : ""} documents</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(doc => (
                        <Card key={doc.id} className="glass-card border-border/50 animate-fade-in-up">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 mt-0.5">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{doc.originalName}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                By <span className="text-foreground">{doc.facultyName}</span> • {doc.categoryName} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                            {doc.description && <p className="text-xs text-muted-foreground mt-1 italic">{doc.description}</p>}
                                            <p className="text-xs text-muted-foreground mt-1">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                            {doc.rejectionReason && (
                                                <p className="text-xs text-destructive mt-1">Reason: {doc.rejectionReason}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={statusBadge(doc.status)}>{doc.status}</Badge>
                                        {doc.status === "pending" && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApprove(doc)}
                                                    disabled={processing === doc.id}
                                                    className="bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                                                >
                                                    {processing === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setShowRejectFor(showRejectFor === doc.id ? null : doc.id)}
                                                    disabled={processing === doc.id}
                                                    className="bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                                                >
                                                    <XCircle className="h-3.5 w-3.5 mr-1" /> Reject
                                                </Button>
                                            </>
                                        )}
                                        {doc.filePath && (
                                            <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="ghost" className="text-muted-foreground">
                                                    <Eye className="h-3.5 w-3.5 mr-1" /> View
                                                </Button>
                                            </a>
                                        )}
                                    </div>
                                </div>
                                {showRejectFor === doc.id && (
                                    <div className="mt-4 flex gap-2 animate-fade-in">
                                        <Input
                                            placeholder="Reason for rejection…"
                                            value={rejectionReason}
                                            onChange={e => setRejectionReason(e.target.value)}
                                            className="bg-secondary/50 border-border flex-1"
                                        />
                                        <Button size="sm" onClick={() => handleReject(doc)} disabled={processing === doc.id} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                            {processing === doc.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm Reject"}
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
