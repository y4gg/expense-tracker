import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: string
    icon?: React.ComponentType
    color?: string
  }
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: Record<string, { label?: string; icon?: React.ComponentType; color?: string }>
  }
>(({ children, config, className, ...props }, ref) => {
  const style = React.useMemo(() => {
    return Object.entries(config).reduce((acc, [key, value]) => {
      if (value.color) {
        acc[`--color-${key}`] = value.color
      }
      return acc
    }, {} as Record<string, string>)
  }, [config])

  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{ height: "100%", ...style }}
      {...props}
    >
      <RechartsPrimitive.ResponsiveContainer width="100%" height="100%">
        {children}
      </RechartsPrimitive.ResponsiveContainer>
    </div>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    active?: boolean
    payload?: Array<{ color?: string; name?: string; value: number; payload?: Record<string, unknown> }>
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
    label?: string
  }
>(
  (
    {
      active,
      payload,
      className,
      hideLabel = false,
      indicator = "dot",
      nameKey,
      labelKey,
      label,
    },
    ref
  ) => {
    if (!active || !payload?.length) {
      return null
    }

    const formattedLabel = label ?? (labelKey ? String(payload[0]?.payload?.[labelKey]) : String(payload[0]?.payload?.label))

    return (
      <div ref={ref} className={cn("rounded-xl border bg-card px-4 py-2 shadow-xl", className)}>
        {!hideLabel && (
          <div className="grid grid-cols-[auto_1fr] items-center gap-2 pb-2">
            <span className="text-[0.70rem] uppercase text-muted-foreground">{formattedLabel}</span>
          </div>
        )}
        <div className="space-y-1">
          {payload.map((value: { color?: string; name?: string; value: number; payload?: Record<string, unknown> }, index: number) => {
            const indicatorColor = typeof value.color === "string" ? value.color : (value.payload?.fill ? String(value.payload.fill) : undefined)
            return (
              <div key={index} className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-2 w-2 shrink-0 rounded-[2px]",
                    indicator === "dot" && "rounded-full",
                    indicator === "line" && "h-0.5 w-2.5",
                    indicator === "dashed" && "h-0.5 w-2.5 border-dash-2 border-2"
                  )}
                  style={{
                    backgroundColor: indicatorColor,
                    borderColor: indicatorColor,
                  }}
                />
                <div className="flex flex-1 items-center justify-between gap-2">
                  <span className="text-[0.8rem] font-medium leading-none text-muted-foreground">
                    {nameKey ? String(value.payload?.[nameKey]) : value.name}
                  </span>
                  <span className="text-[0.8rem] font-semibold leading-none">{value.value}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    payload?: Array<{ color?: string; value?: string; payload?: Record<string, unknown> }>
    verticalAlign?: "top" | "middle" | "bottom"
    hideIcon?: boolean
    nameKey?: string
  }
>(({ className, hideIcon = false, payload, nameKey }, ref) => {
  if (!payload?.length) {
    return null
  }

  return (
    <div ref={ref} className={cn("flex items-center justify-center gap-4", className)}>
      {payload.map((entry: { color?: string; value?: string; payload?: Record<string, unknown> }, index: number) => {
        const item = hideIcon ? (
          <div key={index} className="flex items-center gap-2">
            <span className="text-[0.8rem] font-medium">{entry.value}</span>
          </div>
        ) : (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{
                backgroundColor: entry.color,
              }}
            />
            <span className="text-[0.8rem] font-medium">
              {nameKey ? String(entry.payload?.[nameKey]) : entry.value}
            </span>
          </div>
        )
        return item
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent }
