"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { getFacultyByDepartment, type UserProfile } from "@/lib/firestore"
import { Users } from "lucide-react"

export function DepartmentFacultyPage() {
    const { user } = useAuth()
    const [faculty, setFaculty] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            if (!user?.departmentId) { setLoading(false); return }
            try {
                const data = await getFacultyByDepartment(user.departmentId)
                setFaculty(data)
            } catch (err) { console.error(err) }
            setLoading(false)
        }
        load()
    }, [user])

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Department Faculty</h2>
                <p className="text-sm text-muted-foreground mt-1">Faculty members in {user?.departmentName || "your department"}</p>
            </div>

            {faculty.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <Users className="h-14 w-14 mb-3 opacity-20" />
                    <p>No faculty members in your department</p>
                </div>
            ) : (
                <Card className="glass-card border-border/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-secondary/30">
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {faculty.map(f => (
                                    <tr key={f.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-5 py-3.5 text-sm font-medium text-foreground">{f.name}</td>
                                        <td className="px-5 py-3.5 text-sm text-muted-foreground">{f.email}</td>
                                        <td className="px-5 py-3.5">
                                            <Badge className={f.status === "active" ? "bg-accent/15 text-accent border-accent/20" : "bg-destructive/15 text-destructive border-destructive/20"}>
                                                {f.status || "active"}
                                            </Badge>
                                        </td>
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
