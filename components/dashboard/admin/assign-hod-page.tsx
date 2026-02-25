"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getDepartments, getUsersByRole, updateDepartment, updateUserProfile, type Department, type UserProfile } from "@/lib/firestore"
import { UserCheck, Building2, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function AssignHodPage() {
    const [departments, setDepartments] = useState<Department[]>([])
    const [hods, setHods] = useState<UserProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<string | null>(null)

    async function load() {
        try {
            const [d, h] = await Promise.all([getDepartments(), getUsersByRole("hod")])
            setDepartments(d)
            setHods(h)
        } catch (err) { console.error(err) }
        setLoading(false)
    }

    useEffect(() => { load() }, [])

    async function handleAssign(deptId: string, hodId: string) {
        const dept = departments.find(d => d.id === deptId)
        setSaving(deptId)
        try {
            if (!hodId) {
                // Unassign HOD — clear departmentId on the old HOD's profile
                if (dept?.hodId) {
                    await updateUserProfile(dept.hodId, { departmentId: "", departmentName: "" })
                }
                await updateDepartment(deptId, { hodId: "", hodName: "" })
                toast.success("HOD unassigned")
            } else {
                const hod = hods.find(h => h.id === hodId)
                if (!hod) { setSaving(null); return }
                await updateDepartment(deptId, { hodId: hod.id, hodName: hod.name })
                // Also update the HOD's user profile with the correct department
                await updateUserProfile(hod.id, {
                    departmentId: deptId,
                    departmentName: dept?.departmentName || "",
                })
                toast.success(`${hod.name} assigned as HOD`)
            }
            await load()
        } catch { toast.error("Failed to update HOD") }
        setSaving(null)
    }

    if (loading) {
        return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-2xl font-bold text-foreground">Assign HOD</h2>
                <p className="text-sm text-muted-foreground mt-1">Assign a Head of Department to each department</p>
            </div>

            {departments.length === 0 ? (
                <div className="flex flex-col items-center py-16 text-muted-foreground">
                    <Building2 className="h-14 w-14 mb-3 opacity-20" />
                    <p>Create departments first</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {departments.map((dept, i) => (
                        <Card key={dept.id} className={`glass-card border-border/50 animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                        <Building2 className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">{dept.departmentName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {dept.hodName ? `Current HOD: ${dept.hodName}` : "No HOD assigned"}
                                        </p>
                                    </div>
                                </div>
                                <select
                                    value={dept.hodId || ""}
                                    onChange={(e) => handleAssign(dept.id, e.target.value)}
                                    className="w-full h-10 rounded-md bg-secondary/50 border border-border px-3 text-sm text-foreground"
                                    disabled={saving === dept.id}
                                >
                                    <option value="">Select HOD…</option>
                                    {hods.filter(h => h.departmentId === dept.id).map(h => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                                {saving === dept.id && (
                                    <div className="flex items-center gap-2 mt-2 text-xs text-primary">
                                        <Loader2 className="h-3 w-3 animate-spin" /> Saving…
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
