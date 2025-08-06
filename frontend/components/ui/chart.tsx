"use client"

import * as React from "react"
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"
import { cn } from "@/lib/utils"

// Format: { key: { label: "Label", color: "hsl(var(--chart-1))" } }
export type ChartConfig = {
  [k: string]: {
    label?: string
    icon?: React.ComponentType
    color?: string
  }
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<typeof ResponsiveContainer>["children"]
  }
>(({ config, className, children, ...props }, ref) => {
  const newChildren = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      if (child.type === ResponsiveContainer) {
        return React.cloneElement(
          child as React.ReactElement<typeof ResponsiveContainer>,
          {
            children: React.Children.map(
              child.props.children,
              (grandchild) => {
                if (React.isValidElement(grandchild)) {
                  if (
                    grandchild.type === Line ||
                    grandchild.type === Bar ||
                    grandchild.type === Pie
                  ) {
                    const dataKey = grandchild.props.dataKey as string
                    const color = config[dataKey]?.color

                    if (color) {
                      return React.cloneElement(grandchild, {
                        stroke: color,
                        fill: color,
                      })
                    }
                  }
                }
                return grandchild
              }
            ),
          }
        )
      }
    }
    return child
  })

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        className={cn(
          "flex h-[350px] w-full flex-col items-center justify-center",
          className
        )}
        {...props}
      >
        {newChildren}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Tooltip> &
    React.ComponentProps<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      nameKey?: string
      valueKey?: string
    }
>(
  (
    {
      className,
      viewBox,
      hideLabel = false,
      hideIndicator = false,
      nameKey,
      valueKey,
      payload,
      label,
      ...props
    },
    ref
  ) => {
    const { config } = useChart()

    if (!payload?.length) {
      return null
    }

    const displayedPayload = payload[0]

    const { dataKey, payload: itemPayload } = displayedPayload

    const itemConfig = dataKey ? config[dataKey] : undefined
    const _nameKey = nameKey || itemConfig?.label
    const _valueKey = valueKey || itemConfig?.label

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-2 text-sm shadow-md",
          className
        )}
        {...props}
      >
        {!hideLabel && label ? (
          <div className="mb-1 text-muted-foreground">{label}</div>
        ) : null}
        <div className="flex items-center justify-between gap-x-4">
          <div className="flex items-center gap-x-2">
            {!hideIndicator ? (
              <div
                className={cn(
                  "h-2 w-2 rounded-full",
                  itemConfig?.color && `bg-[--color-${dataKey}]`
                )}
              />
            ) : null}
            {_nameKey ? (
              <span className="text-muted-foreground">
                {_nameKey}:
              </span>
            ) : null}
          </div>
          <span className="font-medium">
            {itemPayload?.[_valueKey || dataKey]}
          </span>
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Legend> & {
    hideIcon?: boolean
  }
>(({ className, hideIcon = false, payload, ...props }, ref) => {
  const { config } = useChart()

  if (!payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      {payload.map((item) => {
        const { value, payload } = item
        const chartConfig = config[value as keyof typeof config]

        return (
          <div
            key={value}
            className={cn(
              "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
              payload?.inactive && "opacity-40"
            )}
          >
            {!hideIcon ? (
              chartConfig?.icon ? (
                <chartConfig.icon />
              ) : (
                <div
                  className={cn(
                    "h-2 w-2 rounded-full",
                    chartConfig?.color && `bg-[--color-${value}]`
                  )}
                />
              )
            ) : null}
            {chartConfig?.label ? (
              <span className="text-xs text-muted-foreground">
                {chartConfig.label}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                {value}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
})
ChartLegend.displayName = "ChartLegend"

export {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend
}
