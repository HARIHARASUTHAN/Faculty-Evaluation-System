"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  getAllUsers, getDepartments, createUserProfile, deleteUserProfile, updateUserProfile,
  type UserProfile, type Department
} from "@/lib/firestore"
import { Users, Plus, Loader2, Search, UserX, Trash2, Pencil, X, Check } from "lucide-react"
import { toast } from "sonner"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

type RoleFilter = "all" | "faculty" | "hod"

export function ManageFacultyPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all")
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", departmentId: "", role: "faculty" as "faculty" | "hod" })
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", departmentId: "", role: "faculty" as "faculty" | "hod" })
  const [saving, setSaving] = useState(false)

  async function load() {
    try {
      const [u, d] = await Promise.all([getAllUsers(), getDepartments()])
      setUsers(u.filter(u => u.role === "faculty" || u.role === "hod"))
      setDepartments(d)
    } catch (err) { console.error(err) }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleAdd() {
    if (!form.name || !form.email || !form.password || !form.departmentId) {
      toast.error("All fields are required")
      return
    }
    setAdding(true)
    try {
      const dept = departments.find(d => d.id === form.departmentId)
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await createUserProfile(userCredential.user.uid, {
        name: form.name,
        email: form.email,
        role: form.role,
        departmentId: form.departmentId,
        departmentName: dept?.departmentName || "",
        status: "active",
      })
      toast.success(`${form.role === "hod" ? "HOD" : "Faculty"} added successfully!`)
      setShowAdd(false)
      setForm({ name: "", email: "", password: "", departmentId: "", role: "faculty" })
      await load()
    } catch (err: any) {
      toast.error(err?.message || "Failed to create user")
    }
    setAdding(false)
  }

  async function handleDelete(user: UserProfile) {
    setDeleting(user.id)
    try {
      await deleteUserProfile(user.id)
      toast.success(`${user.name} has been deleted successfully`)
      await load()
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete user")
    }
    setDeleting(null)
  }

  function startEdit(user: UserProfile) {
    setEditingId(user.id)
    setEditForm({
      name: user.name,
      departmentId: user.departmentId,
      role: user.role as "faculty" | "hod",
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ name: "", departmentId: "", role: "faculty" })
  }

  async function handleSaveEdit(userId: string) {
    if (!editForm.name || !editForm.departmentId) {
      toast.error("Name and department are required")
      return
    }
    setSaving(true)
    try {
      const dept = departments.find(d => d.id === editForm.departmentId)
      await updateUserProfile(userId, {
        name: editForm.name,
        departmentId: editForm.departmentId,
        departmentName: dept?.departmentName || "",
        role: editForm.role,
      })
      toast.success("User updated successfully!")
      setEditingId(null)
      setEditForm({ name: "", departmentId: "", role: "faculty" })
      await load()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user")
    }
    setSaving(false)
  }

  const filtered = users
    .filter(u => roleFilter === "all" || u.role === roleFilter)
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    )

  const filterButtons: { label: string; value: RoleFilter }[] = [
    { label: "All", value: "all" },
    { label: "Faculty", value: "faculty" },
    { label: "HOD", value: "hod" },
  ]

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl bg-card/50 animate-pulse shimmer" />)}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">Manage Faculty & HOD</h2>
          <p className="text-sm text-muted-foreground mt-1">Add and manage faculty members and HODs</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
          <Plus className="h-4 w-4 mr-1" /> Add User
        </Button>
      </div>

      {showAdd && (
        <Card className="glass-card border-primary/20 animate-fade-in-up">
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-secondary/50 border-border mt-1" placeholder="Dr. John Doe" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="bg-secondary/50 border-border mt-1" placeholder="john@university.edu" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="bg-secondary/50 border-border mt-1" placeholder="Min 6 characters" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Department</Label>
                <select
                  value={form.departmentId}
                  onChange={e => setForm({ ...form, departmentId: e.target.value })}
                  className="w-full h-10 rounded-md bg-secondary/50 border border-border px-3 text-sm text-foreground mt-1"
                >
                  <option value="">Select department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Role</Label>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as "faculty" | "hod" })}
                  className="w-full h-10 rounded-md bg-secondary/50 border border-border px-3 text-sm text-foreground mt-1"
                >
                  <option value="faculty">Faculty</option>
                  <option value="hod">HOD</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button onClick={handleAdd} disabled={adding} className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90">
                {adding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                Create User
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + Role Filter */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…" className="pl-9 bg-secondary/50 border-border" />
        </div>
        <div className="flex items-center rounded-lg border border-border bg-secondary/30 p-0.5">
          {filterButtons.map(btn => (
            <button
              key={btn.value}
              onClick={() => setRoleFilter(btn.value)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${roleFilter === btn.value
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <UserX className="h-14 w-14 mb-3 opacity-20" />
          <p className="text-sm">No users found</p>
        </div>
      ) : (
        <Card className="glass-card border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Role</th>
                  <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  editingId === u.id ? (
                    <tr key={u.id} className="border-b border-border/50 bg-primary/5">
                      <td className="px-5 py-3">
                        <Input
                          value={editForm.name}
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-secondary/50 border-border h-9 text-sm"
                          placeholder="Full Name"
                        />
                      </td>
                      <td className="px-5 py-3 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3">
                        <select
                          value={editForm.departmentId}
                          onChange={e => setEditForm({ ...editForm, departmentId: e.target.value })}
                          className="w-full h-9 rounded-md bg-secondary/50 border border-border px-3 text-sm text-foreground"
                        >
                          <option value="">Select department</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.departmentName}</option>)}
                        </select>
                      </td>
                      <td className="px-5 py-3">
                        <select
                          value={editForm.role}
                          onChange={e => setEditForm({ ...editForm, role: e.target.value as "faculty" | "hod" })}
                          className="w-full h-9 rounded-md bg-secondary/50 border border-border px-3 text-sm text-foreground"
                        >
                          <option value="faculty">Faculty</option>
                          <option value="hod">HOD</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-accent hover:text-accent hover:bg-accent/10"
                            disabled={saving}
                            onClick={() => handleSaveEdit(u.id)}
                          >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            onClick={cancelEdit}
                            disabled={saving}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground">{u.name}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{u.departmentName || "—"}</td>
                      <td className="px-5 py-3.5">
                        <Badge className={u.role === "hod" ? "bg-accent/15 text-accent border-accent/20" : "bg-primary/15 text-primary border-primary/20"}>
                          {u.role === "hod" ? "HOD" : "Faculty"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => startEdit(u)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                disabled={deleting === u.id}
                              >
                                {deleting === u.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {u.role === "hod" ? "HOD" : "Faculty"}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete <strong>{u.name}</strong>? This action cannot be undone and will permanently remove this user from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(u)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
