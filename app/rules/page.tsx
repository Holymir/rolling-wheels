"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockRules } from "@/lib/mock-data"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollText, Edit, Printer, Save } from "lucide-react"

type RuleSection = keyof typeof mockRules

export default function RulesPage() {
  const { role } = useAuth()
  const [rules, setRules] = useState(mockRules)
  const [editingSection, setEditingSection] = useState<RuleSection | null>(null)
  const [editContent, setEditContent] = useState("")

  const isAdmin = role === "admin"

  const handleEditSection = (section: RuleSection) => {
    setEditingSection(section)
    setEditContent(rules[section].content)
  }

  const handleSaveSection = () => {
    if (editingSection) {
      setRules({
        ...rules,
        [editingSection]: {
          ...rules[editingSection],
          content: editContent,
        },
      })
      setEditingSection(null)
      setEditContent("")
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const sections = Object.entries(rules) as [RuleSection, (typeof rules)[RuleSection]][]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">MC Rules & Bylaws</h1>
            <p className="text-muted-foreground">Club regulations and code of conduct</p>
          </div>

          <Button variant="outline" size="sm" onClick={handlePrint} className="hidden sm:flex bg-transparent">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
        </div>

        {/* Rules Content */}
        <div className="bg-card border border-border rounded-lg overflow-hidden leather-texture">
          <div className="bg-primary/10 border-b border-border p-6">
            <div className="flex items-center gap-3">
              <ScrollText className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-2xl font-bold text-foreground">Steel Riders MC</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Official Club Documentation</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <Accordion type="single" collapsible className="space-y-4">
              {sections.map(([key, section]) => (
                <AccordionItem
                  key={key}
                  value={key}
                  className="border border-border rounded-lg overflow-hidden bg-background/50"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between w-full pr-4">
                      <h3 className="text-lg font-bold tracking-wide text-foreground uppercase">{section.title}</h3>
                      {isAdmin && (
                        <Dialog>
                          <DialogTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSection(key)}
                              className="ml-auto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Edit {section.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={20}
                                className="font-mono text-sm"
                              />
                              <div className="flex gap-2">
                                <Button onClick={handleSaveSection} className="chrome-button flex-1">
                                  <Save className="h-4 w-4 mr-2" />
                                  Save Changes
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setEditingSection(null)
                                    setEditContent("")
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 py-4">
                    <div className="prose prose-invert prose-sm max-w-none">
                      <RuleContent content={section.content} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Footer */}
          <div className="bg-muted/30 border-t border-border p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Last Updated:{" "}
              {new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              These rules are binding for all members and must be followed at all times
            </p>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .max-w-4xl, .max-w-4xl * {
              visibility: visible;
            }
            .max-w-4xl {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
            button, nav {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  )
}

interface RuleContentProps {
  content: string
}

function RuleContent({ content }: RuleContentProps) {
  // Simple markdown-like rendering
  const lines = content.split("\n")

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        // Bold text
        if (line.startsWith("**") && line.endsWith("**")) {
          const text = line.slice(2, -2)
          return (
            <h4 key={index} className="text-lg font-bold text-primary mt-6 mb-2">
              {text}
            </h4>
          )
        }

        // Bullet points
        if (line.startsWith("- ")) {
          return (
            <li key={index} className="ml-4 text-foreground leading-relaxed">
              {line.slice(2)}
            </li>
          )
        }

        // Numbered lists
        if (/^\d+\./.test(line)) {
          return (
            <li key={index} className="ml-4 text-foreground leading-relaxed list-decimal">
              {line.replace(/^\d+\.\s*/, "")}
            </li>
          )
        }

        // Empty lines
        if (line.trim() === "") {
          return <div key={index} className="h-2" />
        }

        // Regular paragraphs
        return (
          <p key={index} className="text-foreground leading-relaxed">
            {line}
          </p>
        )
      })}
    </div>
  )
}
