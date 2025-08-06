import * as React from "react"

import { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsList = ToastProps[]

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

const toastStore = new Map<string, ToastProps>()

function publish(toast: ToastProps) {
  toastStore.set(toast.id, toast)
  // This is a simplified publish mechanism. In a real app, you'd use a state management library
  // like Zustand, Redux, or React Context with a reducer to manage toasts.
  // For this example, we'll just re-render the Toaster component by updating a dummy state.
  // This is not ideal for performance in a large application but works for a simple demo.
  window.dispatchEvent(new CustomEvent("toast-update"))
}

function remove(id?: string) {
  if (id) {
    toastStore.delete(id)
  } else {
    toastStore.clear()
  }
  window.dispatchEvent(new CustomEvent("toast-update"))
}

type Toast = Omit<ToastProps, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToastProps) => {
    publish({ id, ...props })
  }
  const dismiss = () => {
    remove(id)
  }

  publish({
    id,
    onOpenChange: (open) => {
      if (!open) dismiss()
    },
    ...props,
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastsList>([])

  React.useEffect(() => {
    const handleUpdate = () => {
      setToasts(Array.from(toastStore.values()))
    }
    window.addEventListener("toast-update", handleUpdate)
    return () => {
      window.removeEventListener("toast-update", handleUpdate)
    }
  }, [])

  return {
    toasts,
    toast,
    dismiss: remove,
  }
}
