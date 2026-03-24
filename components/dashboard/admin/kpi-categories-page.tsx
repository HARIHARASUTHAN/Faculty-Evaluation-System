"use client"

import { Card, CardContent } from "@/components/ui/card"
import { KPI_CATEGORIES } from "@/lib/firestore"
import { ClipboardList } from "lucide-react"

export function KpiCategoriesPage() {
    const total = KPI_CATEGORIES.reduce((s, c) => s + c.weightage, 0)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">KPI Categories</h2>
                <p className="text-sm text-muted-foreground mt-1">Evaluation categories with predefined weightage (Total = {total}%)</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {KPI_CATEGORIES.map((cat, i) => (
                    <Card key={cat.id} className={`glass-card border-border/50 hover:border-primary/30 transition-all animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <ClipboardList className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-foreground text-sm">{cat.name}</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-muted-foreground">Weightage</span>
                                    <span className="font-display font-bold text-foreground text-lg">{cat.weightage}%</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Summary */}
            <Card className="glass-card border-border/50">
                <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-foreground">Scoring Scale</p>
                            <p className="text-xs text-muted-foreground mt-1">Each document is scored 1–5 by the HOD. Category Score = Avg(Document Scores) × Weightage</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
