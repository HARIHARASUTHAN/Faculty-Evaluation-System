"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { User, Role } from "./dummy-data"
import { loginUser } from "./dummy-data"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: Role) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback(async (email: string, password: string, role: Role) => {
    setIsLoading(true)
    try {
      const result = await loginUser(email, password, role)
      if (result) {
        setUser(result)
        return true
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}
