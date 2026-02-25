"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getAuditLogs, type AuditLog } from "@/lib/firestore"
import { ShieldCheck, Search } from "lucide-react"

export function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")

    useEffect(() => {
        async function load() {
            try {
                const data = await getAuditLogs()
                setLogs(data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()))
            } catch (err) { console.error(err) }
            setLoading(false)
        }
        load()
    }, [])

    const filtered = logs.filter(log => {
        if (!search) return true
        const q = search.toLowerCase()
        return (
            log.userName.toLowerCase().includes(q) ||
            log.action.toLowerCase().includes(q) ||
            log.details.toLowerCase().includes(q)
        )
    })

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-14 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Audit Logs</h2>
                    <p className="text-sm text-muted-foreground mt-1">Track all system actions for security and compliance</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by user, action, or details…"
                    className="pl-9 bg-secondary/50 border-border"
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <ShieldCheck className="h-14 w-14 mb-3 opacity-20" />
                    <p>{search ? "No matching logs found" : "No audit logs recorded yet"}</p>
                </div>
            ) : (
                <Card className="glass-card border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">User</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(log => (
                                    <tr key={log.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-5 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3 text-sm font-medium text-foreground">{log.userName}</td>
                                        <td className="px-5 py-3 text-sm text-primary">{log.action}</td>
                                        <td className="px-5 py-3 text-sm text-muted-foreground">{log.details}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    )
}

