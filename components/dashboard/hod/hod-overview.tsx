"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import {
    getDocumentsByDepartment, getFacultyByDepartment, getActiveCycle,
    getFinalScoresByDepartment, getFinalScores,
    type FacultyDocument, type UserProfile, type EvaluationCycle, type FinalScore
} from "@/lib/firestore"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Clock, CheckCircle, AlertTriangle, CalendarClock, Award, TrendingUp } from "lucide-react"

export function HodOverview() {
    const { user } = useAuth()
    const [stats, setStats] = useState({ faculty: 0, totalDocs: 0, pending: 0, approved: 0, rejected: 0 })
    const [activeCycle, setActiveCycle] = useState<EvaluationCycle | null>(null)
    const [deptTopFaculty, setDeptTopFaculty] = useState<any[]>([])
    const [overallTopFaculty, setOverallTopFaculty] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user?.departmentId) { setLoading(false); return }
            try {
                const [faculty, docs, cycle, deptScores, allScores] = await Promise.all([
                    getFacultyByDepartment(user.departmentId),
                    getDocumentsByDepartment(user.departmentId),
                    getActiveCycle(),
                    getFinalScoresByDepartment(user.departmentId),
                    getFinalScores(),
                ])
                setStats({
                    faculty: faculty.length,
                    totalDocs: docs.length,
                    pending: docs.filter(d => d.status === "pending").length,
                    approved: docs.filter(d => d.status === "approved").length,
                    rejected: docs.filter(d => d.status === "rejected").length,
                })
                setActiveCycle(cycle)
                
                // Process functions for leaderboard data
                const getTopPerformers = (scoresArr: FinalScore[]) => {
                    const latestByFaculty = new Map<string, FinalScore>()
                    scoresArr.forEach(s => {
                        const existing = latestByFaculty.get(s.facultyId)
                        if (!existing || s.submittedAt > existing.submittedAt) latestByFaculty.set(s.facultyId, s)
                    })
                    return Array.from(latestByFaculty.values())
                        .sort((a, b) => b.totalScore - a.totalScore)
                        .slice(0, 5)
                        .map(f => ({ 
                            id: f.id, 
                            name: f.facultyName, 
                            score: f.totalScore, 
                            year: f.academicYear,
                            department: f.departmentName 
                        }))
                }

                setDeptTopFaculty(getTopPerformers(deptScores))
                setOverallTopFaculty(getTopPerformers(allScores))
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
                    {user?.name || "HOD"}
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

            {/* Leaderboards */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Departmental Leaderboard */}
                <Card className="glass-card border-border/50">
                    <CardHeader>
                        <CardTitle className="font-display text-lg flex items-center gap-2">
                            <Award className="h-5 w-5 text-indigo-500" />
                            Departmental Top Performing Faculty
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {deptTopFaculty.length > 0 ? (
                            <div className="space-y-3">
                                {deptTopFaculty.map((f, i) => (
                                    <div key={f.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 hover:bg-secondary/30 transition-colors">
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg font-display font-bold text-sm ${i === 0 ? "bg-indigo-500 text-white" : i === 1 ? "bg-indigo-400/20 text-indigo-600" : "bg-secondary/50 text-muted-foreground"}`}>
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm truncate">{f.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{f.year}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-display font-bold text-foreground">
                                                {f.score}
                                                <span className="text-[10px] text-muted-foreground ml-0.5">/100</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <Users className="h-12 w-12 mb-3 opacity-30" />
                                <p className="text-sm border-t pt-4 border-border/50 w-full text-center">No departmental data yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Overall Institutional Leaderboard */}
                <Card className="glass-card border-indigo-500/20 bg-gradient-to-br from-white/40 to-indigo-50/20">
                    <CardHeader>
                        <CardTitle className="font-display text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Institutional Top Performing Faculty
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {overallTopFaculty.length > 0 ? (
                            <div className="space-y-3">
                                {overallTopFaculty.map((f, i) => (
                                    <div key={f.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/50 border border-white/50 hover:bg-white shadow-sm transition-all shadow-indigo-100/50">
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-lg font-display font-bold text-sm ${i === 0 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : i === 1 ? "bg-indigo-400 text-white shadow-md shadow-indigo-100" : i === 2 ? "bg-indigo-200 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                                            #{i + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-foreground text-sm truncate">{f.name}</p>
                                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">{f.department}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="font-display font-bold text-indigo-900">
                                                {f.score}
                                                <span className="text-[10px] text-muted-foreground ml-0.5">/100</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mb-3 opacity-30" />
                                <p className="text-sm">No institutional data yet</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
