"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Workaround for https://github.com/recharts/recharts/issues/3615
const ResponsiveContainer = ({
  children,
  ...props
}: React.ComponentProps<typeof RechartsPrimitive.ResponsiveContainer>) => (
  <RechartsPrimitive.ResponsiveContainer {...props}>{children}</RechartsPrimitive.ResponsiveContainer>
)

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

type ChartConfig = {
  [k: string]: {
    label?: string
    icon?: React.ComponentType
  } & ({ color?: string; theme?: never } | { theme?: string; color?: never })
}

type ChartContainerProps = React.ComponentProps<typeof Chart> & {
  config: ChartConfig
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ config, className, children, ...props }, ref) => {
    const id = React.useId()
    if (!config || typeof config !== "object") {
      return null
    }

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          data-chart={id}
          ref={ref}
          className={cn("flex aspect-video justify-center text-foreground", className)}
          {...props}
        >
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    )
  },
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
    React.ComponentPropsWithoutRef<"div"> & {
      hideLabel?: boolean
      hideIndicator?: boolean
      is?: keyof ChartConfig
    }
>(({ active, payload, className, hideLabel = false, hideIndicator = false, is, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  if (!config) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  if (!active || !payload?.length) {
    return null
  }

  const relevantPayload = payload.find((item) => item.dataKey === is)

  return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
        {...props}
      >
        {!hideLabel && relevantPayload?.name && (
          <div className="row-span-2 flex items-center justify-between gap-4">
            <ChartLabel className="flex items-center gap-2">
              {config[relevantPayload.name as keyof ChartConfig]?.icon && (\
                <config[relevantPayload.name as keyof ChartConfig].icon className="h-3 w-3" />
              )}
              {config[relevantPayload.name as keyof ChartConfig]?.label || relevantPayload.name}
            </ChartLabel>
            {relevantPayload.value && (
              <span className="font-semibold text-foreground">
                {relevantPayload.value.toLocaleString()}
              </span>
            )}
          </div>
        )}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            if (item.dataKey === is) return null
            if (hideIndicator) {
              return (
                <div
                  key={item.dataKey}
                  className="flex items-center justify-between gap-4"
                >
                  <ChartLabel>
                    {config[item.dataKey as keyof ChartConfig]?.label || item.dataKey}
                  </ChartLabel>
                  {item.value && (
                    <span className="font-semibold text-foreground">
                      {item.value.toLocaleString()}
                    </span>
                  )}
                </div>
              )
            }

            return (
              <div
                key={item.dataKey}
                className="flex items-center justify-between gap-4"
              >
                <ChartLabel className="flex items-center gap-2">
                  <span
                    className={cn(
                      "flex h-2 w-2 shrink-0 rounded-full",
                      item.color
                    )}
                  />
                  {config[item.dataKey as keyof ChartConfig]?.label || item.dataKey}
                </ChartLabel>
                {item.value && (
                  <span className="font-semibold text-foreground">
                    {item.value.toLocaleString()}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof RechartsPrimitive.Legend> &
    React.ComponentPropsWithoutRef<"div"> & {
      hideIcon?: boolean
    }
>(({ className, hideIcon = false, ...props }, ref) => {
  const { config } = React.useContext(ChartContext)
  if (!config) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return (
    <div ref={ref} className={cn("flex flex-wrap items-center justify-center gap-4", className)} {...props}>
      {props.payload?.map((item) => {
        if (!item.value) return null

        const activeConfig = config[item.value as keyof ChartConfig]
        return (
          <div key={item.value} className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3">
            {activeConfig?.icon && !hideIcon ? (
              <activeConfig.icon />
            ) : (
              <span className={cn("h-2 w-2 shrink-0 rounded-full", item.color ?? activeConfig?.color)} />
            )}
            {activeConfig?.label || item.value}
          </div>
        )
      })}
    </div>
  )
})
ChartLegendContent.displayName = "ChartLegendContent"

const ChartLabel = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<"span">>(
  ({ className, ...props }, ref) => <span ref={ref} className={cn("text-muted-foreground", className)} {...props} />,
)
ChartLabel.displayName = "ChartLabel"

const useChart = () => {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }
  return context
}

const Chart = {
  Container: ChartContainer,
  Tooltip: ChartTooltip,
  TooltipContent: ChartTooltipContent,
  Legend: ChartLegend,
  LegendContent: ChartLegendContent,
  Label: ChartLabel,
  // Recharts components
  AreaChart: RechartsPrimitive.AreaChart,
  Area: RechartsPrimitive.Area,
  BarChart: RechartsPrimitive.BarChart,
  Bar: RechartsPrimitive.Bar,
  LineChart: RechartsPrimitive.LineChart,
  Line: RechartsPrimitive.Line,
  PieChart: RechartsPrimitive.PieChart,
  Pie: RechartsPrimitive.Pie,
  RadialBarChart: RechartsPrimitive.RadialBarChart,
  RadialBar: RechartsPrimitive.RadialBar,
  ScatterChart: RechartsPrimitive.ScatterChart,
  Scatter: RechartsPrimitive.Scatter,
  ComposedChart: RechartsPrimitive.ComposedChart,
  XAxis: RechartsPrimitive.XAxis,
  YAxis: RechartsPrimitive.YAxis,
  CartesianGrid: RechartsPrimitive.CartesianGrid,
  ReferenceLine: RechartsPrimitive.ReferenceLine,
  ReferenceDot: RechartsPrimitive.ReferenceDot,
  ReferenceArea: RechartsPrimitive.ReferenceArea,
  Brush: RechartsPrimitive.Brush,
  ErrorBar: RechartsPrimitive.ErrorBar,
  CartesianAxis: RechartsPrimitive.CartesianAxis,
  PolarGrid: RechartsPrimitive.PolarGrid,
  PolarAngleAxis: RechartsPrimitive.PolarAngleAxis,
  PolarRadiusAxis: RechartsPrimitive.PolarRadiusAxis,
  RadarChart: RechartsPrimitive.RadarChart,
  Radar: RechartsPrimitive.Radar,
  Treemap: RechartsPrimitive.Treemap,
  Sankey: RechartsPrimitive.Sankey,
  Tooltip: RechartsPrimitive.Tooltip,
  Customized: RechartsPrimitive.Customized,
  Cross: RechartsPrimitive.Cross,
  Rectangle: RechartsPrimitive.Rectangle,
  Polygon: RechartsPrimitive.Polygon,
  Dot: RechartsPrimitive.Dot,
  Curve: RechartsPrimitive.Curve,
  Text: RechartsPrimitive.Text,
  LabelList: RechartsPrimitive.LabelList,
  Cell: RechartsPrimitive.Cell,
}

export { Chart, useChart }
