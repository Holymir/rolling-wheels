"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { UserRole, AuthState } from "./types"

// Password configuration (in real app, these would be env variables)
const ROLE_PASSWORDS: Record<UserRole, string> = {
  admin: "admin123",
  member: "member123",
  prospect: "prospect123",
  hangaround: "hangaround123",
  guest: "guest123",
}

interface AuthContextType extends AuthState {
  login: (password: string, role: UserRole, rememberMe: boolean) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    rememberMe: false,
  })

  // Load session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("mc-auth")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setAuthState(parsed)
      } catch (e) {
        console.error("Failed to parse stored auth", e)
      }
    }
  }, [])

  const login = (password: string, role: UserRole, rememberMe: boolean): boolean => {
    if (ROLE_PASSWORDS[role] === password) {
      const newState: AuthState = {
        isAuthenticated: true,
        role,
        rememberMe,
      }
      setAuthState(newState)

      if (rememberMe) {
        localStorage.setItem("mc-auth", JSON.stringify(newState))
      } else {
        localStorage.removeItem("mc-auth")
      }

      return true
    }
    return false
  }

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      role: null,
      rememberMe: false,
    })
    localStorage.removeItem("mc-auth")
  }

  return <AuthContext.Provider value={{ ...authState, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
