"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/auth-context"
import { Pencil } from "lucide-react"

export function ProfilePage() {
  const { user } = useAuth()

  const initials = user?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2) ?? "U"

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">My Profile</h2>
        <p className="text-sm text-muted-foreground">View and update your personal information</p>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-20 w-20 bg-primary text-primary-foreground">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-display">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-center sm:text-left">
              <h3 className="font-display text-lg font-bold text-foreground">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">Associate Professor</p>
              <p className="text-sm text-muted-foreground">Department of {user?.department ?? "Computer Science"}</p>
            </div>
            <Button variant="outline" className="ml-auto hidden sm:flex bg-transparent" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Full Name</Label>
                <Input defaultValue={user?.name} readOnly className="bg-muted/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Email</Label>
                <Input defaultValue={user?.email} readOnly className="bg-muted/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Employee ID</Label>
                <Input defaultValue="EMP-2018-042" readOnly className="bg-muted/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Phone</Label>
                <Input defaultValue="+91 98765 43210" readOnly className="bg-muted/50" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-base">Academic Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Department</Label>
                <Input defaultValue={user?.department ?? "Computer Science"} readOnly className="bg-muted/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Designation</Label>
                <Input defaultValue="Associate Professor" readOnly className="bg-muted/50" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Joining Date</Label>
                <Input defaultValue="June 15, 2018" readOnly className="bg-muted/50" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground">Qualification</Label>
                <Input defaultValue="Ph.D. Computer Science" readOnly className="bg-muted/50" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
