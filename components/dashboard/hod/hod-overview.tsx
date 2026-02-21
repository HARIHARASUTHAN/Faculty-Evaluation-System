"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
    getDocumentsByDepartment, getFacultyByDepartment, getActiveCycle,
    type FacultyDocument, type UserProfile, type EvaluationCycle
} from "@/lib/firestore"
import { Users, FileText, Clock, CheckCircle, AlertTriangle, CalendarClock } from "lucide-react"

export function HodOverview() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ faculty: 0, totalDocs: 0, pending: 0, approved: 0, rejected: 0 })
    const [activeCycle, setActiveCycle] = useState<EvaluationCycle | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user?.departmentId) { setLoading(false); return }
            try {
                const [faculty, docs, cycle] = await Promise.all([
                    getFacultyByDepartment(user.departmentId),
                    getDocumentsByDepartment(user.departmentId),
                    getActiveCycle(),
                ])
                setStats({
                    faculty: faculty.length,
                    totalDocs: docs.length,
                    pending: docs.filter(d => d.status === "pending").length,
                    approved: docs.filter(d => d.status === "approved").length,
                    rejected: docs.filter(d => d.status === "rejected").length,
                })
                setActiveCycle(cycle)
            } catch (err) { console.error(err) }
            setLoading(false)
        }
        load()
    }, [user])

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    const cards = [
        { label: "Department Faculty", value: stats.faculty, icon: Users, gradient: "stat-card-gradient-blue" },
        { label: "Total Documents", value: stats.totalDocs, icon: FileText, gradient: "stat-card-gradient-green" },
        { label: "Pending Review", value: stats.pending, icon: Clock, gradient: "stat-card-gradient-amber" },
        { label: "Approved", value: stats.approved, icon: CheckCircle, gradient: "stat-card-gradient-purple" },
    ]

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="glass-card rounded-2xl p-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                    Welcome, {user?.name || "HOD"} 👋
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    {user?.departmentName ? `Department: ${user.departmentName}` : "No department assigned"}
                </p>
                {activeCycle && (
                    <div className="flex items-center gap-2 mt-3 text-xs text-primary">
                        <CalendarClock className="h-4 w-4" />
                        Active Cycle: <span className="font-semibold">{activeCycle.academicYear}</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <Card key={i} className={`border-0 ${card.gradient} animate-fade-in-up stagger-${i + 1}`}>
                        <CardContent className="p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                                    <p className="mt-2 font-display text-3xl font-bold text-foreground">{card.value}</p>
                                </div>
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">
                                    <card.icon className="h-6 w-6 text-foreground/70" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {stats.pending > 0 && (
                <Card className="glass-card border-amber-500/20">
                    <CardContent className="p-5 flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400" />
                        <p className="text-sm text-foreground">
                            You have <span className="font-bold text-amber-400">{stats.pending}</span> documents pending review.
                            Go to <span className="text-primary font-medium">Review Documents</span> to approve or reject them.
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
