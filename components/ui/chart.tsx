"use client"

import * as React from "react"
import {
  ChartContainer as RechartsChartContainer,
  type ChartContainerProps as RechartsChartContainerProps,
} from "@/components/ui/chart"
import { cn } from "@/lib/utils"

// Define ChartConfig type (simplified for example, extend as needed)
type ChartConfig = {
  [k: string]: {
    label?: string
    color?: string
    icon?: React.ComponentType<{ className?: string }>
  }
}

// Define ChartContext type
type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within <ChartProvider>")
  }

  return context
}

interface ChartProps extends RechartsChartContainerProps {
  config: ChartConfig
}

const Chart = React.forwardRef<HTMLDivElement, ChartProps>(({ config, className, children, ...props }, ref) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <RechartsChartContainer ref={ref} className={cn("flex h-[400px] w-full", className)} {...props}>
        {children}
      </RechartsChartContainer>
    </ChartContext.Provider>
  )
})
Chart.displayName = "Chart"

export { Chart, useChart }
