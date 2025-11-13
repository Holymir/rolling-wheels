"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useAuth } from "@/lib/auth-context"
import { mockMembers, mockPayments } from "@/lib/mock-data"
import type { Member, Payment } from "@/lib/types"
import { Navigation } from "@/components/navigation"
import { StatusIndicator } from "@/components/status-indicator"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Download, CheckCircle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LedgerPage() {
  const { role } = useAuth()
  const [members] = useState<Member[]>(mockMembers)
  const [payments, setPayments] = useState<Payment[]>(mockPayments)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedMember, setSelectedMember] = useState<string | null>(null)

  const isAdmin = role === "admin"

  // Create ledger data by combining members with their payment info
  const ledgerData = useMemo(() => {
    return members.map((member) => {
      const memberPayments = payments.filter((p) => p.memberId === member.id)
      const latestPayment = memberPayments.sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
      )[0]

      const paidThisYear = memberPayments
        .filter((p) => p.status === "paid" && new Date(p.paidDate!).getFullYear() === new Date().getFullYear())
        .reduce((sum, p) => sum + p.amount, 0)

      return {
        member,
        latestPayment,
        paidThisYear,
      }
    })
  }, [members, payments])

  // Filter ledger data
  const filteredLedger = useMemo(() => {
    if (statusFilter === "all") return ledgerData
    return ledgerData.filter((item) => item.latestPayment?.status === statusFilter)
  }, [ledgerData, statusFilter])

  const handleMarkPaid = (payment: Payment) => {
    setPayments(
      payments.map((p) =>
        p.id === payment.id ? { ...p, status: "paid" as const, paidDate: new Date().toISOString().split("T")[0] } : p,
      ),
    )
  }

  const handleAddPayment = (newPayment: Omit<Payment, "id">) => {
    const payment: Payment = {
      ...newPayment,
      id: Date.now().toString(),
    }
    setPayments([...payments, payment])
    setIsPaymentModalOpen(false)
    setSelectedMember(null)
  }

  const handleExportCSV = () => {
    const headers = ["Member", "Road Name", "Amount", "Status", "Due Date", "Paid Date", "YTD Total"]
    const rows = filteredLedger.map((item) => [
      item.member.realName,
      item.member.roadName,
      item.latestPayment?.amount || 0,
      item.latestPayment?.status || "N/A",
      item.latestPayment?.dueDate || "N/A",
      item.latestPayment?.paidDate || "N/A",
      item.paidThisYear,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ledger-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
  }

  // Calculate totals
  const totals = useMemo(() => {
    const paid = ledgerData.filter((item) => item.latestPayment?.status === "paid").length
    const pending = ledgerData.filter((item) => item.latestPayment?.status === "pending").length
    const overdue = ledgerData.filter((item) => item.latestPayment?.status === "overdue").length
    const totalCollected = ledgerData.reduce((sum, item) => sum + item.paidThisYear, 0)

    return { paid, pending, overdue, totalCollected }
  }, [ledgerData])

  // If member (not admin), only show their own data
  const displayData = isAdmin ? filteredLedger : ledgerData.filter((item) => item.member.role === role)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Member Ledger</h1>
          <p className="text-muted-foreground">Track membership dues and payment status</p>
        </div>

        {/* Stats Cards - Admin only */}
        {isAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard
              icon={<CheckCircle className="h-5 w-5" />}
              label="Paid"
              value={totals.paid}
              className="border-green-600/30 bg-green-600/5"
            />
            <StatsCard
              icon={<Clock className="h-5 w-5" />}
              label="Pending"
              value={totals.pending}
              className="border-yellow-600/30 bg-yellow-600/5"
            />
            <StatsCard
              icon={<Clock className="h-5 w-5" />}
              label="Overdue"
              value={totals.overdue}
              className="border-destructive/30 bg-destructive/5"
            />
            <StatsCard
              icon={<DollarSign className="h-5 w-5" />}
              label="YTD Collected"
              value={`$${totals.totalCollected}`}
              className="border-primary/30 bg-primary/5"
            />
          </div>
        )}

        {/* Filters and Actions */}
        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>

              <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogTrigger asChild>
                  <Button className="chrome-button">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Log Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Payment</DialogTitle>
                  </DialogHeader>
                  <PaymentForm members={members} onSubmit={handleAddPayment} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}

        {/* Desktop Table */}
        <div className="hidden md:block bg-card border border-border rounded-lg overflow-hidden leather-texture">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-foreground font-bold uppercase tracking-wide">Member</TableHead>
                <TableHead className="text-foreground font-bold uppercase tracking-wide">Road Name</TableHead>
                <TableHead className="text-foreground font-bold uppercase tracking-wide">Amount</TableHead>
                <TableHead className="text-foreground font-bold uppercase tracking-wide">Status</TableHead>
                <TableHead className="text-foreground font-bold uppercase tracking-wide">Due Date</TableHead>
                <TableHead className="text-foreground font-bold uppercase tracking-wide">Paid Date</TableHead>
                <TableHead className="text-foreground font-bold uppercase tracking-wide">YTD Total</TableHead>
                {isAdmin && (
                  <TableHead className="text-foreground font-bold uppercase tracking-wide">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((item) => (
                <TableRow key={item.member.id} className="border-border">
                  <TableCell className="font-medium">{item.member.realName}</TableCell>
                  <TableCell className="text-primary font-bold">{item.member.roadName}</TableCell>
                  <TableCell>{item.latestPayment ? `$${item.latestPayment.amount}` : "N/A"}</TableCell>
                  <TableCell>
                    {item.latestPayment ? (
                      <StatusIndicator status={item.latestPayment.status} />
                    ) : (
                      <span className="text-muted-foreground">No data</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.latestPayment ? new Date(item.latestPayment.dueDate).toLocaleDateString() : "N/A"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.latestPayment?.paidDate ? new Date(item.latestPayment.paidDate).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell className="font-bold text-primary">${item.paidThisYear}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      {item.latestPayment?.status !== "paid" && item.latestPayment && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkPaid(item.latestPayment!)}
                          className="text-xs"
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-4">
          {displayData.map((item) => (
            <div key={item.member.id} className="bg-card border border-border rounded-lg p-4 leather-texture">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-foreground">{item.member.roadName}</h3>
                  <p className="text-sm text-muted-foreground">{item.member.realName}</p>
                </div>
                {item.latestPayment && <StatusIndicator status={item.latestPayment.status} />}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Amount</p>
                  <p className="font-medium">{item.latestPayment ? `$${item.latestPayment.amount}` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {item.latestPayment ? new Date(item.latestPayment.dueDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Paid Date</p>
                  <p className="font-medium">
                    {item.latestPayment?.paidDate ? new Date(item.latestPayment.paidDate).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">YTD Total</p>
                  <p className="font-bold text-primary">${item.paidThisYear}</p>
                </div>
              </div>

              {isAdmin && item.latestPayment?.status !== "paid" && item.latestPayment && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMarkPaid(item.latestPayment!)}
                  className="w-full mt-4"
                >
                  Mark Paid
                </Button>
              )}
            </div>
          ))}
        </div>

        {displayData.length === 0 && (
          <div className="text-center py-12 bg-card border border-border rounded-lg">
            <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No ledger data found</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface StatsCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  className?: string
}

function StatsCard({ icon, label, value, className }: StatsCardProps) {
  return (
    <div className={cn("bg-card border rounded-lg p-4 leather-texture", className)}>
      <div className="flex items-center gap-3">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  )
}

interface PaymentFormProps {
  members: Member[]
  onSubmit: (payment: Omit<Payment, "id">) => void
}

function PaymentForm({ members, onSubmit }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    memberId: "",
    amount: "",
    dueDate: new Date().toISOString().split("T")[0],
    paidDate: "",
    status: "pending" as const,
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      amount: Number.parseFloat(formData.amount),
      paidDate: formData.paidDate || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="memberId">Member *</Label>
        <Select value={formData.memberId} onValueChange={(value) => setFormData({ ...formData, memberId: value })}>
          <SelectTrigger id="memberId">
            <SelectValue placeholder="Select member" />
          </SelectTrigger>
          <SelectContent>
            {members.map((member) => (
              <SelectItem key={member.id} value={member.id}>
                {member.roadName} ({member.realName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount *</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="50.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData({ ...formData, status: value as "paid" | "pending" | "overdue" })}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paidDate">Paid Date</Label>
          <Input
            id="paidDate"
            type="date"
            value={formData.paidDate}
            onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional payment notes..."
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full chrome-button">
        Log Payment
      </Button>
    </form>
  )
}
