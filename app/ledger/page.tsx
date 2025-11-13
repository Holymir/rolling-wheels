"use client"

import type React from "react"
import { useState, useMemo, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DollarSign, Loader2, CheckCircle, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ApiPayment {
  id: string
  memberId: string
  amount: number
  dueDate: string
  paidDate: string | null
  status: string
  notes: string | null
  member: {
    id: string
    roadName: string
    realName: string
  }
}

export default function LedgerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<ApiPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const isAdmin = session?.user?.role === "admin"

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  // Fetch payments
  useEffect(() => {
    if (status === "authenticated") {
      fetchPayments()
    }
  }, [status])

  const fetchPayments = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/payments")
      if (!response.ok) {
        throw new Error("Failed to fetch payments")
      }
      const data = await response.json()
      setPayments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      console.error("Error fetching payments:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Group payments by member
  const ledgerData = useMemo(() => {
    const grouped = new Map<string, { member: ApiPayment["member"]; payments: ApiPayment[] }>()

    payments.forEach((payment) => {
      const key = payment.memberId
      if (!grouped.has(key)) {
        grouped.set(key, { member: payment.member, payments: [] })
      }
      grouped.get(key)!.payments.push(payment)
    })

    return Array.from(grouped.values()).map((item) => {
      const sortedPayments = item.payments.sort((a, b) =>
        new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      )
      const latestPayment = sortedPayments[0]
      const paidThisYear = item.payments
        .filter((p) => p.status === "paid" && p.paidDate && new Date(p.paidDate).getFullYear() === new Date().getFullYear())
        .reduce((sum, p) => sum + p.amount, 0)

      return {
        member: item.member,
        latestPayment,
        paidThisYear,
        allPayments: sortedPayments,
      }
    })
  }, [payments])

  // Filter ledger data
  const filteredLedger = useMemo(() => {
    if (statusFilter === "all") return ledgerData
    return ledgerData.filter((item) => item.latestPayment?.status === statusFilter)
  }, [ledgerData, statusFilter])

  const handleMarkPaid = async (paymentId: string) => {
    if (!isAdmin) return

    try {
      const response = await fetch(`/api/payments/${paymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "paid",
          paidDate: new Date().toISOString(),
        }),
      })
      if (!response.ok) {
        throw new Error("Failed to update payment")
      }
      fetchPayments()
    } catch (err) {
      console.error("Error updating payment:", err)
      alert("Failed to mark payment as paid")
    }
  }

  // Calculate summary stats
  const summary = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0)
    const paid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + p.amount, 0)
    const pending = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.amount, 0)
    const overdue = payments.filter((p) => p.status === "overdue").reduce((sum, p) => sum + p.amount, 0)

    return { total, paid, pending, overdue }
  }, [payments])

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
            <p className="font-bold">Error loading payments</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Club Ledger</h1>
          <p className="text-muted-foreground">Member dues and payment tracking</p>
        </div>

        {/* Summary Cards */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-lg p-6 leather-texture">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Total</p>
              </div>
              <p className="text-3xl font-bold text-foreground">${summary.total.toFixed(2)}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 leather-texture">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Paid</p>
              </div>
              <p className="text-3xl font-bold text-green-600">${summary.paid.toFixed(2)}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 leather-texture">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Pending</p>
              </div>
              <p className="text-3xl font-bold text-yellow-600">${summary.pending.toFixed(2)}</p>
            </div>

            <div className="bg-card border border-border rounded-lg p-6 leather-texture">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-destructive" />
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Overdue</p>
              </div>
              <p className="text-3xl font-bold text-destructive">${summary.overdue.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ledger Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Road Name</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Paid Date</TableHead>
                {isAdmin && <TableHead>YTD Total</TableHead>}
                {isAdmin && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLedger.map((item) => {
                const payment = item.latestPayment
                if (!payment) return null

                const statusColors = {
                  paid: "text-green-600 bg-green-600/10 border-green-600/20",
                  pending: "text-yellow-600 bg-yellow-600/10 border-yellow-600/20",
                  overdue: "text-destructive bg-destructive/10 border-destructive/20",
                }

                return (
                  <TableRow key={item.member.id}>
                    <TableCell className="font-medium">{item.member.realName}</TableCell>
                    <TableCell>{item.member.roadName}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-bold uppercase tracking-wide border",
                          statusColors[payment.status as keyof typeof statusColors],
                        )}
                      >
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>{new Date(payment.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : "-"}
                    </TableCell>
                    {isAdmin && <TableCell className="font-bold">${item.paidThisYear.toFixed(2)}</TableCell>}
                    {isAdmin && (
                      <TableCell>
                        {payment.status === "pending" && (
                          <Button size="sm" variant="outline" onClick={() => handleMarkPaid(payment.id)}>
                            Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {filteredLedger.length === 0 && (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No payments found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
