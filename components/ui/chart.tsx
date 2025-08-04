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
  RadialBar,
  RadialBarChart,
  Area,
  AreaChart,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Define a type for the chart components
type ChartComponent =
  | typeof LineChart
  | typeof BarChart
  | typeof PieChart
  | typeof RadialBarChart
  | typeof AreaChart
  | typeof ScatterChart

// Define a map for chart components
const chartComponents = {
  LineChart,
  BarChart,
  PieChart,
  RadialBarChart,
  AreaChart,
  ScatterChart,
}

// Define a map for chart elements
const chartElements = {
  CartesianGrid,
  Line,
  Bar,
  Pie,
  RadialBar,
  Area,
  Scatter,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig
  children: React.ReactNode
  className?: string
  chartType: keyof typeof chartComponents
  data: Record<string, any>[]
  tooltipContent?: React.ComponentType<TooltipProps<any, any>>
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(
  (
    {
      config,
      children,
      className,
      chartType,
      data,
      tooltipContent: TooltipContent,
      ...props
    },
    ref
  ) => {
    const ChartComponent = chartComponents[chartType]

    if (!ChartComponent) {
      console.warn(`Unknown chart type: ${chartType}`)
      return null
    }

    return (
      <ChartContainer
        ref={ref}
        config={config}
        className={cn("min-h-[200px] w-full", className)}
        {...props}
      >
        <ChartComponent data={data}>
          {children}
          <ChartLegend content={<ChartLegendContent />} />
          {TooltipContent ? (
            <ChartTooltip content={<TooltipContent />} />
          ) : (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
        </ChartComponent>
      </ChartContainer>
    )
  }
)

Chart.displayName = "Chart"

export { Chart, chartElements }
