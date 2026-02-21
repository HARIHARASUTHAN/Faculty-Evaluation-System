import React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/theme-provider"

import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" })

export const metadata: Metadata = {
  title: "FPES — Faculty Performance Evaluation System",
  description:
    "A comprehensive, modern faculty performance evaluation and management system for universities. Track evaluations, manage departments, and generate performance reports.",
  keywords: "faculty evaluation, university management, performance tracking, academic evaluation",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}

