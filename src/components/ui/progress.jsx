import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

function Progress({
  className,
  value = 0,
  indicatorClassName,
  animate = true,
  durationMs = 600,
  ...props
}) {
  const [internalValue, setInternalValue] = React.useState(0)

  React.useEffect(() => {
    if (!animate) {
      setInternalValue(value ?? 0)
      return
    }
    // Trigger transition to the new value on the next frame
    let raf = requestAnimationFrame(() => setInternalValue(value ?? 0))
    return () => cancelAnimationFrame(raf)
  }, [value, animate])

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}>
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={cn(
          "h-full w-full flex-1 transition-transform ease-out",
          indicatorClassName || "bg-primary"
        )}
        style={{
          transform: `translateX(-${100 - (internalValue || 0)}%)`,
          transitionDuration: `${Math.max(0, durationMs)}ms`
        }} />
    </ProgressPrimitive.Root>
  );
}

export { Progress }
