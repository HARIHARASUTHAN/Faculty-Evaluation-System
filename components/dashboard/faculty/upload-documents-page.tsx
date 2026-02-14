"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, File } from "lucide-react"

interface UploadedDoc {
  name: string
  type: string
  size: string
  date: string
}

const existingDocs: UploadedDoc[] = [
  { name: "Research_Paper_ML_2024.pdf", type: "Research Paper", size: "2.4 MB", date: "Dec 15, 2024" },
  { name: "Teaching_Certificate_2024.pdf", type: "Certificate", size: "1.1 MB", date: "Nov 20, 2024" },
  { name: "Conference_Proceedings.pdf", type: "Research Paper", size: "3.8 MB", date: "Oct 5, 2024" },
  { name: "FDP_Completion_Certificate.pdf", type: "Certificate", size: "0.8 MB", date: "Sep 12, 2024" },
]

export function UploadDocumentsPage() {
  const [docs, setDocs] = useState(existingDocs)
  const [isDragActive, setIsDragActive] = useState(false)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragActive(false)
    // Simulate file upload
    const newDoc: UploadedDoc = {
      name: "New_Document.pdf",
      type: "Other",
      size: "1.2 MB",
      date: "Feb 11, 2026",
    }
    setDocs((prev) => [newDoc, ...prev])
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Upload Documents</h2>
        <p className="text-sm text-muted-foreground">Upload certificates, research papers, and supporting documents</p>
      </div>

      {/* Upload area */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragActive(true)
            }}
            onDragLeave={() => setIsDragActive(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border"
            }`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-medium text-foreground">Drag and drop files here</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Supports PDF, DOC, DOCX up to 10MB
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <File className="mr-2 h-4 w-4" />
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded documents */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-display text-base">Uploaded Documents ({docs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            {docs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <FileText className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {doc.size} - Uploaded {doc.date}
                  </p>
                </div>
                <Badge variant="outline" className="hidden sm:inline-flex">
                  {doc.type}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setDocs((prev) => prev.filter((_, idx) => idx !== i))}
                  aria-label="Remove document"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
