"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
    getFinalScoresByFaculty, KPI_CATEGORIES, type FinalScore
} from "@/lib/firestore"
import { TrendingUp, Award } from "lucide-react"

export function EvaluationResultsPage() {
    const { user } = useAuth()
    const [scores, setScores] = useState<FinalScore[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user?.uid) { setLoading(false); return }
            try {
                const data = await getFinalScoresByFaculty(user.uid)
                setScores(data.sort((a, b) => b.academicYear.localeCompare(a.academicYear)))
            } catch (err) { console.error(err) }
            setLoading(false)
        }
        load()
    }, [user])

    if (loading) {
        return <div className="space-y-4">{[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Evaluation Results</h2>
                <p className="text-sm text-muted-foreground mt-1">Your performance scores and grades by academic year</p>
            </div>

            {scores.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <Award className="h-14 w-14 mb-3 opacity-20" />
                    <p>No evaluation results yet</p>
                    <p className="text-xs mt-1">Results will appear after the HOD submits your evaluation</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {scores.map((score, idx) => (
                        <Card key={score.id} className={`glass-card border-border/50 animate-fade-in-up stagger-${Math.min(idx + 1, 4)}`}>
                            <CardHeader>
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <CardTitle className="font-display text-xl">{score.academicYear}</CardTitle>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="font-display text-3xl font-bold text-foreground">{score.totalScore}</p>
                                            <p className="text-xs text-muted-foreground">/100</p>
                                        </div>
                                        <Badge className={`text-lg px-4 py-1 ${score.grade === "A" ? "bg-accent/15 text-accent border-accent/20" : score.grade === "B" ? "bg-primary/15 text-primary border-primary/20" : score.grade === "C" ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-destructive/15 text-destructive border-destructive/20"}`}>
                                            Grade {score.grade}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Category Breakdown</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {KPI_CATEGORIES.map(cat => {
                                        const cs = score.categoryScores?.[cat.id] || { avgScore: 0, weightedScore: 0, docCount: 0 }
                                        return (
                                            <div key={cat.id} className="rounded-xl bg-secondary/30 p-3">
                                                <p className="text-xs text-muted-foreground">{cat.name}</p>
                                                <div className="flex items-end justify-between mt-1">
                                                    <div>
                                                        <p className="font-display text-lg font-bold text-foreground">
                                                            {cs.weightedScore}<span className="text-xs text-muted-foreground">/{cat.weightage}</span>
                                                        </p>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground">{cs.docCount} docs, avg {cs.avgScore}/5</p>
                                                </div>
                                                <div className="h-1.5 rounded-full bg-secondary/50 overflow-hidden mt-2">
                                                    <div
                                                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                                                        style={{ width: `${cat.weightage > 0 ? (cs.weightedScore / cat.weightage) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-4">Evaluated by: {score.hodName} • {new Date(score.submittedAt).toLocaleDateString()}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
