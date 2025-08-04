"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Clock, Users } from "lucide-react"

interface SnookerTableTimerProps {
  tableId: number
}

type TableStatus = "available" | "occupied" | "reserved"

export function SnookerTableTimer({ tableId }: SnookerTableTimerProps) {
  const [isRunning, setIsRunning] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const [status, setStatus] = React.useState<TableStatus>(
    Math.random() > 0.6 ? "available" : Math.random() > 0.5 ? "occupied" : "reserved",
  )

  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && status === "occupied") {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    } else if (!isRunning && time !== 0) {
      if (interval) clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, time, status])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleStart = () => {
    setStatus("occupied")
    setIsRunning(true)
  }

  const handlePause = () => {
    setIsRunning(!isRunning)
  }

  const handleStop = () => {
    setIsRunning(false)
    setTime(0)
    setStatus("available")
  }

  const getStatusColor = () => {
    switch (status) {
      case "available":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusBadgeVariant = () => {
    switch (status) {
      case "available":
        return "default"
      case "occupied":
        return "destructive"
      case "reserved":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Table {tableId}</CardTitle>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        </div>
        <Badge variant={getStatusBadgeVariant()} className="w-fit">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold">
              <Clock className="w-5 h-5" />
              {formatTime(time)}
            </div>
            {status === "occupied" && (
              <p className="text-sm text-muted-foreground mt-1">${((time / 3600) * 12).toFixed(2)} earned</p>
            )}
          </div>
        </div>

        {status === "reserved" && (
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Reserved for John Smith</span>
          </div>
        )}

        <div className="flex gap-2">
          {status === "available" && (
            <Button onClick={handleStart} className="flex-1" size="sm">
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}

          {status === "occupied" && (
            <>
              <Button onClick={handlePause} variant="outline" className="flex-1 bg-transparent" size="sm">
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-1" />
                    Resume
                  </>
                )}
              </Button>
              <Button onClick={handleStop} variant="destructive" className="flex-1" size="sm">
                <Square className="w-4 h-4 mr-1" />
                Stop
              </Button>
            </>
          )}

          {status === "reserved" && (
            <Button onClick={() => setStatus("available")} variant="outline" className="flex-1" size="sm">
              Cancel Reservation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
