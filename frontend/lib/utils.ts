import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a C# TimeSpan string (e.g., "00:00:00", "01:30:00") into milliseconds.
 * This function handles the format returned by .NET's TimeSpan.ToString().
 * It does not handle days or more complex TimeSpan formats.
 * @param timeSpanString The TimeSpan string from the backend.
 * @returns The duration in milliseconds.
 */
export function parseTimeSpanToMilliseconds(timeSpanString: string): number {
  if (!timeSpanString) return 0

  // Expected format: "HH:mm:ss.fff" or "HH:mm:ss"
  const parts = timeSpanString.split(":")
  if (parts.length < 3) {
    console.warn("Unexpected TimeSpan format:", timeSpanString)
    return 0
  }

  const hours = parseInt(parts[0], 10) || 0
  const minutes = parseInt(parts[1], 10) || 0
  const secondsAndMs = parts[2].split(".")
  const seconds = parseInt(secondsAndMs[0], 10) || 0
  const milliseconds = secondsAndMs.length > 1 ? parseInt(secondsAndMs[1].substring(0, 3), 10) || 0 : 0

  return (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds
}
