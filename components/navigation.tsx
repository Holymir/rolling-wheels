"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, Bike } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { RoleBadge } from "./role-badge"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface NavLink {
  href: string
  label: string
  allowedRoles: string[]
}

const navLinks: NavLink[] = [
  {
    href: "/members",
    label: "Members",
    allowedRoles: ["admin", "member", "prospect"],
  },
  {
    href: "/ledger",
    label: "Ledger",
    allowedRoles: ["admin", "member"],
  },
  {
    href: "/rules",
    label: "Rules",
    allowedRoles: ["admin", "member", "prospect", "hangaround", "guest"],
  },
  {
    href: "/events",
    label: "Events",
    allowedRoles: ["admin", "member", "prospect", "hangaround", "guest"],
  },
]

export function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { role, logout } = useAuth()

  const visibleLinks = navLinks.filter((link) => (role ? link.allowedRoles.includes(role) : false))

  return (
    <nav className="leather-texture bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/members" className="flex items-center gap-3">
            <div className="bg-primary p-2 rounded">
              <Bike className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">STEEL RIDERS MC</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-bold tracking-wide uppercase transition-colors",
                  pathname === link.href
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center gap-4">
            {role && <RoleBadge role={role} />}
            <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 py-4 space-y-3">
            {visibleLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block px-3 py-2 text-base font-bold tracking-wide uppercase transition-colors rounded",
                  pathname === link.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              {role && <RoleBadge role={role} />}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
