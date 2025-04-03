
import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & { color?: string }
>(({ className, value, color, ...props }, ref) => {
  // Ensure value is between 0 and 100
  const safeValue = value !== undefined ? Math.max(0, Math.min(100, value)) : 0;
  
  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ 
          transform: `translateX(-${100 - safeValue}%)`,
          width: '100%',
          backgroundColor: color || 'var(--progress-color, var(--primary))'
        }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
