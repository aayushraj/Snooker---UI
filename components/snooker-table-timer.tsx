"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, Square, Clock, Users } from 'lucide-react'
import { formatTime } from '@/lib/utils';

interface SnookerTableTimerProps {
  tableId: number
  searchQuery?: string
  activeFilter?: "all" | "active" | "paused" | "available" | "reserved"
  startTime: string; // ISO string
  pausedDuration: number; // in milliseconds
  isPaused: boolean;
}

type TableStatus = "available" | "occupied" | "paused" | "reserved"

export function SnookerTableTimer({ tableId, searchQuery = "", activeFilter = "all", startTime, pausedDuration, isPaused }: SnookerTableTimerProps) {
  const [elapsedTime, setElapsedTime] = React.useState(0);

  React.useEffect(() => {
    const startMs = new Date(startTime).getTime();
    let animationFrameId: number;

    const updateTimer = () => {
      if (!isPaused) {
        const currentElapsed = Date.now() - startMs - pausedDuration;
        setElapsedTime(currentElapsed);
      }
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    if (startTime) {
      animationFrameId = requestAnimationFrame(updateTimer);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [startTime, pausedDuration, isPaused]);

  const [status, setStatus] = React.useState<TableStatus>(() => {
    const rand = Math.random()
    if (rand > 0.6) return "available"
    if (rand > 0.4) return "occupied"
    if (rand > 0.2) return "paused"
    return "reserved"
  });

  const shouldShow = React.useMemo(() => {
    // Search filter
    if (searchQuery && !`Table ${tableId}`.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Status filter
    if (activeFilter !== "all" && status !== activeFilter) {
      return false
    }

    return true
  }, [tableId, searchQuery, activeFilter, status])

  if (!shouldShow) {
    return null
  }

  const handleStart = () => {
    setStatus("occupied")
  }

  const handlePause = () => {
    setStatus((prevStatus) => (prevStatus === "occupied" ? "paused" : "occupied"))
  }

  const handleStop = () => {
    setStatus("available")
  }

  const getStatusColor = () => {
    switch (status) {
      case "available":
        return "bg-emerald-500"
      case "occupied":
        return "bg-green-500"
      case "paused":
        return "bg-amber-500"
      case "reserved":
        return "bg-blue-500"
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
      case "paused":
        return "secondary"
      case "reserved":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="w-full border-green-100 bg-gradient-to-br from-green-50/50 to-emerald-50/50 hover:shadow-md transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-green-800">Table {tableId}</CardTitle>
          <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        </div>
        <Badge variant={getStatusBadgeVariant()} className="w-fit">
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-mono font-bold text-green-700">
              <Clock className="w-5 h-5" />
              {formatTime(elapsedTime)}
            </div>
            {status === "occupied" && (
              <p className="text-sm text-green-600 mt-1">${((elapsedTime / 3600000) * 12).toFixed(2)} earned</p>
            )}
          </div>
        </div>

        {status === "reserved" && (
          <div className="flex items-center justify-center gap-1 text-sm text-slate-600">
            <Users className="w-4 h-4" />
            <span>Reserved for John Smith</span>
          </div>
        )}

        <div className="flex gap-2">
          {status === "available" && (
            <Button onClick={handleStart} className="flex-1 bg-green-600 hover:bg-green-700" size="sm">
              <Play className="w-4 h-4 mr-1" />
              Start
            </Button>
          )}

          {(status === "occupied" || status === "paused") && (
            <>
              <Button
                onClick={handlePause}
                variant="outline"
                className="flex-1 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
                size="sm"
              >
                {status === "occupied" ? (
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
            <Button
              onClick={() => setStatus("available")}
              variant="outline"
              className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
              size="sm"
            >
              Cancel Reservation
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
