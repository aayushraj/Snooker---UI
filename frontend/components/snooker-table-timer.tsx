"use client"

import React, { useState, useEffect, useRef } from "react"
import { formatDuration, intervalToDuration } from "date-fns"

interface SnookerTableTimerProps {
  startTime: string // ISO string
  pausedDurationMs: number // Total milliseconds the session has been paused
  status: "Active" | "Paused" | "Ended"
}

export function SnookerTableTimer({ startTime, pausedDurationMs, status }: SnookerTableTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const calculateElapsedTime = () => {
    const start = new Date(startTime).getTime()
    const now = Date.now()
    return now - start - pausedDurationMs
  }

  useEffect(() => {
    if (status === "Active") {
      // Clear any existing interval to prevent duplicates
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Initialize elapsed time
      setElapsedTime(calculateElapsedTime())

      // Set up interval to update every second
      intervalRef.current = setInterval(() => {
        setElapsedTime(calculateElapsedTime())
      }, 1000)
    } else {
      // If paused or ended, clear the interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // For paused/ended, ensure the displayed time is accurate based on the last known state
      // This might need to be adjusted if the backend sends the *current* total elapsed time
      // rather than just start time and paused duration. For now, we recalculate based on start and total paused.
      setElapsedTime(calculateElapsedTime())
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startTime, pausedDurationMs, status])

  const duration = intervalToDuration({ start: 0, end: elapsedTime })

  const formattedDuration = formatDuration(duration, {
    format: ["hours", "minutes", "seconds"],
    zero: true,
    delimiter: ":",
    locale: {
      formatDistance: (token, count) => {
        if (token === "xHours") return `${count.toString().padStart(2, "0")}`
        if (token === "xMinutes") return `${count.toString().padStart(2, "0")}`
        if (token === "xSeconds") return `${count.toString().padStart(2, "0")}`
        return ""
      },
    },
  })

  return (
    <div className="text-lg font-semibold">
      Time: <span className="tabular-nums">{formattedDuration}</span>
      <span
        className={`ml-2 text-sm font-normal ${
          status === "Active" ? "text-green-500" : status === "Paused" ? "text-snooker-blue" : "text-red-500"
        }`}
      >
        ({status})
      </span>
    </div>
  )
}
