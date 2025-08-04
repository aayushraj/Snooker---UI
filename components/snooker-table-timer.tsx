"use client"

import { useEffect, useState, useRef } from "react"
import { intervalToDuration } from "date-fns"

interface SnookerTableTimerProps {
  startTime: string // ISO string
  pausedAt?: string | null // ISO string
  pausedDuration?: number // in milliseconds
  status: "Active" | "Paused" | "Ended"
}

export default function SnookerTableTimer({ startTime, pausedAt, pausedDuration = 0, status }: SnookerTableTimerProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const start = new Date(startTime).getTime()

    const calculateElapsedTime = () => {
      if (status === "Ended") {
        // If session ended, calculate final duration
        const end = new Date().getTime() // This should ideally come from the session.endTime
        // For display purposes, if status is ended, we assume the timer stops at the last calculated duration
        // In a real app, you'd pass the actual end time and calculate final duration
        return end - start - pausedDuration
      }

      let currentElapsed = Date.now() - start

      if (status === "Paused" && pausedAt) {
        // If paused, add the duration from start to pausedAt, and then the already accumulated pausedDuration
        currentElapsed = new Date(pausedAt).getTime() - start
      } else if (status === "Active") {
        // If active, subtract the total paused duration from the current elapsed time
        currentElapsed -= pausedDuration
      }
      return currentElapsed
    }

    setElapsedTime(calculateElapsedTime())

    if (status === "Active") {
      intervalRef.current = setInterval(() => {
        setElapsedTime(calculateElapsedTime())
      }, 1000) // Update every second
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [startTime, pausedAt, pausedDuration, status])

  const formatTime = (ms: number) => {
    if (ms < 0) ms = 0 // Ensure no negative time

    const duration = intervalToDuration({ start: 0, end: ms })

    const hours = duration.hours || 0
    const minutes = duration.minutes || 0
    const seconds = duration.seconds || 0

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
  }

  return <div className="font-mono text-xl font-semibold">{formatTime(elapsedTime)}</div>
}
