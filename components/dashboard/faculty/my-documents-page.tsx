"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { getDocumentsByFaculty, deleteDocument, addAuditLog, type FacultyDocument } from "@/lib/firestore"
import { FileText, Trash2, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

export function MyDocumentsPage() {
    const { user } = useAuth()
    const [docs, setDocs] = useState<FacultyDocument[]>([])
    const [loading, setLoading] = useState(true)

    async function load() {
        if (!user?.uid) { setLoading(false); return }
        try {
            const data = await getDocumentsByFaculty(user.uid)
            setDocs(data.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()))
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    useEffect(() => { load() }, [user])

    async function handleDelete(doc: FacultyDocument) {
        if (doc.status !== "pending") {
            toast.error("Only pending documents can be deleted")
            return
        }
        try {
            await deleteDocument(doc.id)
            await addAuditLog({
                userId: user!.uid, userName: user!.name,
                action: "Document Deleted",
                details: `"${doc.originalName}" in ${doc.categoryName}`,
                timestamp: new Date().toISOString(),
            })
            toast.success("Document deleted")
            await load()
        } catch { toast.error("Failed to delete") }
    }

    const statusIcon = (status: string) => {
        if (status === "approved") return <CheckCircle className="h-4 w-4 text-accent" />
        if (status === "rejected") return <XCircle className="h-4 w-4 text-destructive" />
        return <Clock className="h-4 w-4 text-amber-400" />
    }

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
                <h2 className="font-display text-2xl font-bold text-foreground">My Documents</h2>
                <p className="text-sm text-muted-foreground mt-1">{docs.length} document(s) uploaded</p>
            </div>

            {docs.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <FileText className="h-14 w-14 mb-3 opacity-20" />
                    <p>No documents uploaded yet</p>
                    <p className="text-xs mt-1">Go to Upload Documents to start</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {docs.map((doc, i) => (
                        <Card key={doc.id} className={`glass-card border-border/50 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 mt-0.5">
                                            {statusIcon(doc.status)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground text-sm">{doc.originalName}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {doc.categoryName} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.academicYear}
                                            </p>
                                            {doc.description && <p className="text-xs text-muted-foreground mt-1 italic line-clamp-2">{doc.description}</p>}
                                            <p className="text-xs text-muted-foreground mt-1">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                            {doc.rejectionReason && (
                                                <p className="text-xs text-destructive mt-1">❌ Reason: {doc.rejectionReason}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge className={statusBadge(doc.status)}>{doc.status}</Badge>
                                        {doc.filePath && (
                                            <a href={doc.filePath} target="_blank" rel="noopener noreferrer">
                                                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-primary">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </a>
                                        )}
                                        {doc.status === "pending" && (
                                            <Button size="sm" variant="ghost" onClick={() => handleDelete(doc)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
