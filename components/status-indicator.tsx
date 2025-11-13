import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "paid" | "pending" | "overdue"
  className?: string
}

const statusConfig = {
  paid: {
    color: "bg-green-600",
    label: "Paid",
  },
  pending: {
    color: "bg-yellow-600",
    label: "Pending",
  },
  overdue: {
    color: "bg-destructive",
    label: "Overdue",
  },
}

export function StatusIndicator({ status, className }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("w-2 h-2 rounded-full", config.color)} />
      <span className="text-sm font-medium">{config.label}</span>
    </div>
  )
}
