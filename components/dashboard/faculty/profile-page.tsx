"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { updateUserProfile, getUserProfile } from "@/lib/firestore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  User, Mail, Building2, Phone, GraduationCap,
  Briefcase, Save, Loader2, Pencil, CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

interface ProfileData {
  name: string
  email: string
  phone: string
  departmentName: string
  qualification: string
  designation: string
}

export function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    departmentName: "",
    qualification: "",
    designation: "",
  })

  useEffect(() => {
    async function load() {
      if (!user?.uid) return
      try {
        const profile = await getUserProfile(user.uid)
        if (profile) {
          setForm({
            name: profile.name || user.name || "",
            email: profile.email || user.email || "",
            phone: (profile as any).phone || "",
            departmentName: profile.departmentName || user.departmentName || "",
            qualification: (profile as any).qualification || "",
            designation: (profile as any).designation || "",
          })
        } else {
          setForm({
            name: user.name || "",
            email: user.email || "",
            phone: "",
            departmentName: user.departmentName || "",
            qualification: "",
            designation: "",
          })
        }
      } catch (err) {
        console.error("Failed to load profile:", err)
      }
      setLoading(false)
    }
    load()
  }, [user])

  async function handleSave() {
    if (!user?.uid) return
    setSaving(true)
    try {
      await updateUserProfile(user.uid, {
        name: form.name,
        phone: form.phone,
        departmentName: form.departmentName,
        qualification: form.qualification,
        designation: form.designation,
      })
      toast.success("Profile updated successfully!")
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error("Save error:", err)
      toast.error("Failed to update profile")
    }
    setSaving(false)
  }

  if (!user) return null

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)

  const roleLabel =
    user.role === "hod"
      ? "Head of Department"
      : user.role === "admin"
        ? "Administrator"
        : "Faculty Member"

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 rounded-2xl bg-card/50 animate-pulse shimmer" />
        <div className="h-64 rounded-2xl bg-card/50 animate-pulse shimmer" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">My Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View and manage your account information
          </p>
        </div>
        {!editing ? (
          <Button
            onClick={() => setEditing(true)}
            className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setEditing(false)}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-blue-500 hover:opacity-90"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Success banner */}
      {saved && (
        <div className="flex items-center gap-3 rounded-2xl bg-accent/10 border border-accent/20 p-4 animate-fade-in">
          <CheckCircle className="h-5 w-5 text-accent" />
          <p className="text-sm text-accent font-medium">
            Your profile has been updated successfully!
          </p>
        </div>
      )}

      {/* Profile header card */}
      <Card className="glass-card border-border/50 overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-blue-500/20 to-accent/20" />
        <CardContent className="p-6 -mt-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white text-2xl font-display font-bold shadow-xl shadow-primary/20 ring-4 ring-background">
              {initials}
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-foreground">
                {form.name || user.name}
              </h3>
              <p className="text-sm text-muted-foreground">{form.email || user.email}</p>
            </div>
            <Badge className="px-4 py-1.5 bg-primary/15 text-primary border-primary/20 text-sm">
              {roleLabel}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Full Name
              </Label>
              {editing ? (
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-secondary/50 border-border h-11"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    {form.name || "Not set"}
                  </p>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                Email Address
              </Label>
              <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                <p className="text-sm font-medium text-foreground">{form.email}</p>
                <Badge className="text-[10px] bg-secondary/50 text-muted-foreground border-border ml-auto">
                  Verified
                </Badge>
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                Phone Number
              </Label>
              {editing ? (
                <Input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  className="bg-secondary/50 border-border h-11"
                  type="tel"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    {form.phone || (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </p>
                </div>
              )}
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            Academic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Department */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Department
              </Label>
              {editing ? (
                <Input
                  value={form.departmentName}
                  onChange={(e) =>
                    setForm({ ...form, departmentName: e.target.value })
                  }
                  placeholder="e.g. Computer Science"
                  className="bg-secondary/50 border-border h-11"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    {form.departmentName || (
                      <span className="text-muted-foreground italic">Not assigned</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Qualification */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="h-3.5 w-3.5" />
                Qualification
              </Label>
              {editing ? (
                <Input
                  value={form.qualification}
                  onChange={(e) =>
                    setForm({ ...form, qualification: e.target.value })
                  }
                  placeholder="e.g. Ph.D. in Computer Science"
                  className="bg-secondary/50 border-border h-11"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    {form.qualification || (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Designation */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                Designation
              </Label>
              {editing ? (
                <Input
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                  placeholder="e.g. Assistant Professor"
                  className="bg-secondary/50 border-border h-11"
                />
              ) : (
                <div className="flex items-center gap-3 rounded-xl bg-secondary/30 p-3.5">
                  <p className="text-sm font-medium text-foreground">
                    {form.designation || (
                      <span className="text-muted-foreground italic">Not provided</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>


    </div>
  )
}
