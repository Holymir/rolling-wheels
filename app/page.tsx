"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bike } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { UserRole } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export default function LoginPage() {
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<UserRole>("guest")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/members")
    }
  }, [isAuthenticated, router])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const success = login(password, selectedRole, rememberMe)

    if (success) {
      router.push("/members")
    } else {
      setError("Invalid password for selected access level")
      setPassword("")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 leather-texture">
      <div className="w-full max-w-md space-y-8">
        {/* MC Logo/Patch */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-primary rounded-full mb-4 chrome-button">
            <Bike className="h-12 w-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">STEEL RIDERS MC</h1>
          <p className="text-muted-foreground text-sm tracking-wider uppercase">Member Access Portal</p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-bold tracking-wide uppercase">
                Access Level
              </Label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="hangaround">Hangaround</SelectItem>
                  <SelectItem value="guest">Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold tracking-wide uppercase">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full"
                required
              />
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me
              </Label>
            </div>

            <Button type="submit" className="w-full chrome-button" size="lg">
              <span className="font-bold tracking-wide uppercase">Access Club</span>
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo Passwords:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                Admin: <span className="text-foreground">admin123</span>
              </div>
              <div>
                Member: <span className="text-foreground">member123</span>
              </div>
              <div>
                Prospect: <span className="text-foreground">prospect123</span>
              </div>
              <div>
                Guest: <span className="text-foreground">guest123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
