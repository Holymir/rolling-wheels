"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/members")
    }
  }, [status, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Invalid username or password")
        setPassword("")
      } else if (result?.ok) {
        router.push("/members")
      }
    } catch (err) {
      setError("An error occurred during login")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Bike className="h-12 w-12 animate-pulse mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
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
              <Label htmlFor="username" className="text-sm font-bold tracking-wide uppercase">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full"
                required
                autoComplete="username"
              />
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
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-2 rounded text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full chrome-button"
              size="lg"
              disabled={isLoading}
            >
              <span className="font-bold tracking-wide uppercase">
                {isLoading ? "Logging in..." : "Access Club"}
              </span>
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center mb-2">Demo Accounts:</p>
            <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
              <div>
                <span className="font-bold">Admin:</span> username: <span className="text-foreground">admin</span>, password: <span className="text-foreground">admin123</span>
              </div>
              <div>
                <span className="font-bold">Member:</span> username: <span className="text-foreground">john_steel</span>, password: <span className="text-foreground">member123</span>
              </div>
              <div>
                <span className="font-bold">Prospect:</span> username: <span className="text-foreground">jake_rookie</span>, password: <span className="text-foreground">prospect123</span>
              </div>
              <div>
                <span className="font-bold">Guest:</span> username: <span className="text-foreground">visitor</span>, password: <span className="text-foreground">guest123</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
