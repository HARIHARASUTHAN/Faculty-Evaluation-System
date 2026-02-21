"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getDepartments, addDepartment, deleteDepartment, type Department } from "@/lib/firestore"
import { Building2, Plus, Trash2, Loader2, Users } from "lucide-react"
import { toast } from "sonner"

export function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)

  async function load() {
    try {
      const data = await getDepartments()
      setDepartments(data)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    try {
      await addDepartment({ departmentName: newName.trim(), hodId: "", hodName: "" })
      toast.success("Department created!")
      setNewName("")
      await load()
    } catch (err) { toast.error("Failed to create department") }
    setAdding(false)
  }

  async function handleDelete(id: string) {
    try {
      await deleteDepartment(id)
      toast.success("Department deleted")
      setDepartments(prev => prev.filter(d => d.id !== id))
    } catch { toast.error("Failed to delete") }
  }

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Departments</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage institution departments</p>
        </div>
      </div>

      {/* Add new */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-5">
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1 block">Department Name</Label>
              <Input
                placeholder="e.g. Computer Science"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-secondary/50 border-border"
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <Button onClick={handleAdd} disabled={adding || !newName.trim()} className="mt-5 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      {departments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Building2 className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No departments yet</p>
          <p className="text-sm">Create your first department above</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <Card key={dept.id} className={`glass-card border-border/50 hover:border-primary/30 transition-all animate-fade-in-up stagger-${Math.min(i + 1, 6)}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{dept.departmentName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {dept.hodName ? `HOD: ${dept.hodName}` : "No HOD assigned"}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(dept.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
