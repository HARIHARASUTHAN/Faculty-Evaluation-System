"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth-context"
import { addDocument, getActiveCycle, getDocumentsByFacultyAndYear, addAuditLog, KPI_CATEGORIES, type KPICategoryId } from "@/lib/firestore"
import { Upload, FileText, Loader2, CheckCircle, AlertTriangle } from "lucide-react"
import { toast } from "sonner"

export function UploadDocumentsPage() {
  const { user } = useAuth()
  const fileRef = useRef<HTMLInputElement>(null)
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [activeCycleYear, setActiveCycleYear] = useState("")
  const [dragOver, setDragOver] = useState(false)
  const [submittedCategories, setSubmittedCategories] = useState<Set<string>>(new Set())

  async function loadSubmittedCategories(cycleYear: string) {
    if (!user?.uid || !cycleYear) return
    try {
      const docs = await getDocumentsByFacultyAndYear(user.uid, cycleYear)
      setSubmittedCategories(new Set(docs.map(d => d.category)))
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    getActiveCycle().then(c => {
      if (c) {
        setActiveCycleYear(c.academicYear)
        loadSubmittedCategories(c.academicYear)
      }
    })
  }, [user])

  const availableCategories = KPI_CATEGORIES.filter(c => !submittedCategories.has(c.id))

  function handleFileSelect(f: File) {
    if (f.type !== "application/pdf") {
      toast.error("Only PDF files are allowed")
      return
    }
    if (f.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5 MB")
      return
    }
    setFile(f)
    setSuccess(false)
  }

  async function handleUpload() {
    if (!file || !user || !activeCycleYear) return
    setUploading(true)
    try {
      // Generate unique filename
      const uniqueName = `${crypto.randomUUID()}_${file.name}`

      // Upload to Cloudinary
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)
      formData.append("folder", `faculty-documents/${user.uid}`)
      formData.append("public_id", uniqueName.replace(".pdf", ""))

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/raw/upload`,
        { method: "POST", body: formData }
      )

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData?.error?.message || "Cloudinary upload failed")
      }

      const cloudinaryData = await res.json()
      const url = cloudinaryData.secure_url

      const catName = KPI_CATEGORIES.find(c => c.id === category)?.name || category

      await addDocument({
        facultyId: user.uid,
        facultyName: user.name,
        departmentId: user.departmentId || "",
        departmentName: user.departmentName || "",
        category: category as KPICategoryId,
        categoryName: catName,
        fileName: uniqueName,
        originalName: file.name,
        filePath: url,
        fileSize: file.size,
        description,
        uploadedAt: new Date().toISOString(),
        status: "pending",
        academicYear: activeCycleYear,
      })

      await addAuditLog({
        userId: user.uid, userName: user.name,
        action: "Document Uploaded",
        details: `"${file.name}" in ${catName}`,
        timestamp: new Date().toISOString(),
      })

      toast.success("Document uploaded successfully!")
      setSuccess(true)
      setFile(null)
      setDescription("")
      setCategory("")
      if (fileRef.current) fileRef.current.value = ""
      // Reload submitted categories to update dropdown
      await loadSubmittedCategories(activeCycleYear)
    } catch (err: any) {
      console.error("Upload error:", err)
      toast.error(err?.message || "Upload failed")
    }
    setUploading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Upload Documents</h2>
        <p className="text-sm text-muted-foreground mt-1">Upload PDF achievement documents for evaluation</p>
      </div>

      {!activeCycleYear && (
        <Card className="glass-card border-amber-500/20">
          <CardContent className="p-5 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-400" />
            <p className="text-sm text-foreground">No active evaluation cycle. Uploads are disabled until the admin activates one.</p>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-border/50">
        <CardContent className="p-6 space-y-5">
          {/* Category selection */}
          <div>
            <Label className="text-xs text-muted-foreground">Document Category</Label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as KPICategoryId)}
              className="w-full h-10 rounded-md bg-secondary/50 border border-border px-3 text-sm text-foreground mt-1"
            >
              <option value="">Choose document category</option>
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.weightage}%)</option>
              ))}
            </select>
            {availableCategories.length === 0 && activeCycleYear && (
              <p className="text-xs text-accent mt-1.5">✓ All categories already submitted for {activeCycleYear}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className="text-xs text-muted-foreground">Description</Label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this document…"
              className="w-full h-20 rounded-lg bg-secondary/50 border border-border p-3 text-sm text-foreground resize-none focus:border-primary focus:outline-none mt-1"
            />
          </div>

          {/* File drop zone */}
          <div>
            <Label className="text-xs text-muted-foreground">PDF File (Max 5 MB)</Label>
            <div
              className={`mt-1 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 transition-all cursor-pointer ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFileSelect(e.dataTransfer.files[0]) }}
              onClick={() => fileRef.current?.click()}
            >
              <Upload className={`h-10 w-10 mb-3 ${dragOver ? "text-primary" : "text-muted-foreground/40"}`} />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Drag & drop your PDF here or click to browse"}
              </p>
              {file && <p className="text-xs text-muted-foreground mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>}
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]) }}
              />
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !activeCycleYear || !category}
            className="w-full h-12 bg-gradient-to-r from-primary to-blue-500 hover:opacity-90 text-base font-medium"
          >
            {uploading ? (
              <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Uploading…</>
            ) : success ? (
              <><CheckCircle className="h-5 w-5 mr-2" /> Upload Another</>
            ) : (
              <><Upload className="h-5 w-5 mr-2" /> Upload Document</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="glass-card border-border/50">
        <CardContent className="p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Upload Requirements</p>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• File type: <span className="text-foreground">PDF only</span></li>
            <li>• Max size: <span className="text-foreground">5 MB</span></li>
            <li>• Select the correct category before uploading</li>
            <li>• Rejected documents can be re-uploaded</li>
            <li>• Duplicate uploads are tracked by filename</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
