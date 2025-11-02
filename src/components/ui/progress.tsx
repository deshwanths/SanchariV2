
"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type ProgressProps = React.ComponentPropsWithoutRef<"div"> & {
  value?: number | null
}

const Progress = React.forwardRef<
  HTMLDivElement,
  ProgressProps
>(({ className, value, ...props }, ref) => {
  const progress = value || 0;
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-white/20",
        className
      )}
      {...props}
    >
      <motion.div
        className="h-full bg-primary-gradient rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
