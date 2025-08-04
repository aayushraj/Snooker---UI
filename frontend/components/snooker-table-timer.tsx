"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface SnookerTableTimerProps {
  startTime: string
  pausedDurationMs: number
  status: "Active" | "Paused" | "Ended"
}

export function SnookerTableTimer({ startTime, pausedDurationMs, status }: SnookerTableTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const startTimestamp = new Date(startTime).getTime()

    const calculateElapsedTime = () => {
      if (status === "Active") {
        const now = Date.now()
        const currentElapsedTime = now - startTimestamp - pausedDurationMs
        setElapsedTime(currentElapsedTime > 0 ? currentElapsedTime : 0)
      }
    }

    if (status === "Active") {
      intervalRef.current = setInterval(calculateElapsedTime, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Set initial elapsed time when component mounts or status changes
    calculateElapsedTime()

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startTime, pausedDurationMs, status])

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, "0")).join(":")
  }

  const timerColorClass = cn(
    "font-mono text-lg",
    status === "Active" && "text-snooker-green",
    status === "Paused" && "text-snooker-blue",
    status === "Ended" && "text-muted-foreground",
  )

  return (
    <div className="flex flex-col items-center">
      <span className={timerColorClass}>{formatTime(elapsedTime)}</span>
      <span className="text-xs text-muted-foreground">
        {status === "Active" && "Running"}
        {status === "Paused" && "Paused"}
        {status === "Ended" && "Ended"}
      </span>
    </div>
  )
}
