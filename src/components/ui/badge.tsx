import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variant === "default" && "border-transparent bg-blue-600 text-white hover:bg-blue-700",
        variant === "secondary" && "border-transparent bg-gray-100 text-slate-800 hover:bg-gray-200",
        variant === "destructive" && "border-transparent bg-red-600 text-white hover:bg-red-700",
        variant === "outline" && "text-slate-800",
        className
      )}
      {...props}
    />
  )
}

export { Badge }