"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollText, Edit, Plus, Loader2 } from "lucide-react"

interface ApiRule {
  id: string
  title: string
  description: string
  category: string
  order: number
}

export default function RulesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [rules, setRules] = useState<ApiRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<ApiRule | null>(null)

  const isAdmin = session?.user?.role === "admin"

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // Fetch rules
  useEffect(() => {
    if (status === "authenticated") {
      fetchRules()
    }
  }, [status])

  const fetchRules = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/rules")
      if (!response.ok) {
        throw new Error("Failed to fetch rules")
      }
      const data = await response.json()
      setRules(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching rules:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddRule = async (newRule: any) => {
    try {
      const response = await fetch("/api/rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRule),
      })
      if (!response.ok) {
        throw new Error("Failed to create rule")
      }
      setIsAddModalOpen(false)
      fetchRules()
    } catch (err) {
      console.error("Error creating rule:", err)
      alert("Failed to create rule")
    }
  }

  const handleUpdateRule = async (updatedRule: ApiRule) => {
    try {
      const response = await fetch(`/api/rules/${updatedRule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: updatedRule.title,
          description: updatedRule.description,
          category: updatedRule.category,
          order: updatedRule.order,
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to update rule")
      }
      setEditingRule(null)
      fetchRules()
    } catch (err) {
      console.error("Error updating rule:", err)
      alert("Failed to update rule")
    }
  }

  const handleDeleteRule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) {
      return
    }

    try {
      const response = await fetch(`/api/rules/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Failed to delete rule")
      }
      fetchRules()
    } catch (err) {
      console.error("Error deleting rule:", err)
      alert("Failed to delete rule")
    }
  }

  // Group rules by category
  const rulesByCategory = rules.reduce((acc, rule) => {
    if (!acc[rule.category]) {
      acc[rule.category] = []
    }
    acc[rule.category].push(rule)
    return acc
  }, {} as Record<string, ApiRule[]>)

  if (status === "loading" || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-destructive/20 border border-destructive text-destructive-foreground px-4 py-3 rounded">
            <p className="font-bold">Error loading rules</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Club Bylaws & Rules</h1>
            <p className="text-muted-foreground">Official club regulations and code of conduct</p>
          </div>
          {isAdmin && (
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button className="chrome-button">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Rule</DialogTitle>
                </DialogHeader>
                <RuleForm onSubmit={handleAddRule} />
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Rules Accordion */}
        <div className="bg-card border border-border rounded-lg overflow-hidden leather-texture">
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(rulesByCategory).map(([category, categoryRules], idx) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <ScrollText className="h-5 w-5 text-primary" />
                    <span className="text-lg font-bold uppercase tracking-wide">
                      {category.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-muted-foreground">({categoryRules.length})</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 py-4 space-y-4">
                  {categoryRules.sort((a, b) => a.order - b.order).map((rule) => (
                    <div
                      key={rule.id}
                      className="p-4 bg-background border border-border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-foreground">{rule.title}</h3>
                        {isAdmin && (
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingRule(rule)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              Delete
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {rule.description}
                      </p>
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {rules.length === 0 && (
            <div className="text-center py-12">
              <ScrollText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No rules found</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingRule && (
        <Dialog open={!!editingRule} onOpenChange={() => setEditingRule(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Rule</DialogTitle>
            </DialogHeader>
            <RuleForm rule={editingRule} onSubmit={handleUpdateRule} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

interface RuleFormProps {
  rule?: ApiRule
  onSubmit: (rule: any) => void
}

function RuleForm({ rule, onSubmit }: RuleFormProps) {
  const [formData, setFormData] = useState({
    title: rule?.title || "",
    description: rule?.description || "",
    category: rule?.category || "general",
    order: rule?.order || 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(rule ? { ...rule, ...formData } : formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Rule Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Rule title..."
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category *</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="riding">Riding</SelectItem>
            <SelectItem value="meetings">Meetings</SelectItem>
            <SelectItem value="conduct">Conduct</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="order">Order</Label>
        <Input
          id="order"
          type="number"
          value={formData.order}
          onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
        <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Rule description..."
          rows={6}
          required
        />
      </div>

      <Button type="submit" className="w-full chrome-button">
        {rule ? "Update Rule" : "Add Rule"}
      </Button>
    </form>
  )
}
