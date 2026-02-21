"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  type User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

const googleProvider = new GoogleAuthProvider()

// Emails that should automatically receive admin role
const ADMIN_EMAILS = [
  "hariharasuthans2005@gmail.com",
]

export type Role = "admin" | "hod" | "faculty"

export interface AppUser {
  uid: string
  name: string
  email: string
  role: Role
  departmentId?: string
  departmentName?: string
  avatar?: string
}

interface AuthContextType {
  user: AppUser | null
  firebaseUser: FirebaseUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser)
        // Fetch user profile from Firestore
        try {
          const isAdmin = ADMIN_EMAILS.includes((fbUser.email || "").toLowerCase())
          const userDocRef = doc(db, "users", fbUser.uid)
          const userDoc = await getDoc(userDocRef)
          if (userDoc.exists()) {
            const data = userDoc.data()
            // Auto-upgrade to admin if email is in the admin list
            const effectiveRole = isAdmin ? "admin" : (data.role || "faculty")
            if (isAdmin && data.role !== "admin") {
              await setDoc(userDocRef, { role: "admin" }, { merge: true })
            }
            setUser({
              uid: fbUser.uid,
              name: data.name || fbUser.displayName || "User",
              email: fbUser.email || "",
              role: effectiveRole as Role,
              departmentId: data.departmentId,
              departmentName: data.departmentName,
              avatar: data.avatar,
            })
          } else {
            // User exists in Auth but not Firestore — create profile
            const newRole = isAdmin ? "admin" : "faculty"
            await setDoc(userDocRef, {
              name: fbUser.displayName || "User",
              email: fbUser.email || "",
              role: newRole,
              departmentId: "",
              departmentName: "",
              avatar: fbUser.photoURL || "",
              status: "active",
              createdAt: new Date().toISOString(),
            })
            setUser({
              uid: fbUser.uid,
              name: fbUser.displayName || "User",
              email: fbUser.email || "",
              role: newRole as Role,
            })
          }
        } catch {
          setUser({
            uid: fbUser.uid,
            name: fbUser.displayName || "User",
            email: fbUser.email || "",
            role: "faculty",
          })
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      let message = "Login failed. Please try again."
      if (err.code === "auth/user-not-found") message = "No account found with this email."
      else if (err.code === "auth/wrong-password") message = "Incorrect password."
      else if (err.code === "auth/invalid-email") message = "Invalid email format."
      else if (err.code === "auth/invalid-credential") message = "Invalid email or password."
      else if (err.code === "auth/too-many-requests") message = "Too many attempts. Try again later."
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const fbUser = result.user
      // Check if user profile exists in Firestore; if not, create one
      const isAdmin = ADMIN_EMAILS.includes((fbUser.email || "").toLowerCase())
      const userDoc = await getDoc(doc(db, "users", fbUser.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, "users", fbUser.uid), {
          name: fbUser.displayName || "User",
          email: fbUser.email || "",
          role: isAdmin ? "admin" : "faculty",
          departmentId: "",
          departmentName: "",
          avatar: fbUser.photoURL || "",
          status: "active",
          createdAt: new Date().toISOString(),
        })
      }
      return { success: true }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      let message = "Google sign-in failed. Please try again."
      if (err.code === "auth/popup-closed-by-user") message = "Sign-in popup was closed."
      else if (err.code === "auth/cancelled-popup-request") message = "Sign-in was cancelled."
      else if (err.code === "auth/popup-blocked") message = "Popup was blocked. Please allow popups."
      return { success: false, error: message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut(auth)
    setUser(null)
    setFirebaseUser(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true }
    } catch (error: unknown) {
      const err = error as { code?: string }
      let message = "Failed to send reset email."
      if (err.code === "auth/user-not-found") message = "No account found with this email."
      return { success: false, error: message }
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, firebaseUser, isLoading, login, loginWithGoogle, logout, resetPassword, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
