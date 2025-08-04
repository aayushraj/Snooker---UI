"use client"

import * as React from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "react-resizable-panels"

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean
}

export function Sidebar({ className, isCollapsed, ...props }: SidebarProps) {
  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2",
        className
      )}
      {...props}
    />
  )
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

function SidebarProvider({ children, defaultCollapsed = false }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)

  const toggleCollapse = React.useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const value = React.useMemo(() => ({ isCollapsed, toggleCollapse }), [isCollapsed, toggleCollapse])

  return (
    <div>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { isCollapsed })
        }
        return child
      })}
    </div>
  )
}

interface SidebarInsetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarInset = React.forwardRef<HTMLDivElement, SidebarInsetProps>(
  ({ children, className, ...props }, ref) => (
    <ResizablePanel ref={ref} className={cn("flex flex-col", className)} {...props}>
      {children}
    </ResizablePanel>
  )
)
SidebarInset.displayName = "SidebarInset"

interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarHeader = React.forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("flex h-16 items-center justify-center", className)} {...props}>
      {children}
    </div>
  )
)
SidebarHeader.displayName = "SidebarHeader"

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarContent = React.forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ children, className, ...props }, ref) => (
    <ScrollArea ref={ref} className={cn("flex-1 py-4", className)} {...props}>
      <div className="grid gap-2 px-4">{children}</div>
    </ScrollArea>
  )
)
SidebarContent.displayName = "SidebarContent"

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-2", className)} {...props}>
      {children}
    </div>
  )
)
SidebarGroup.displayName = "SidebarGroup"

interface SidebarGroupLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ children, className, ...props }, ref) => {
    const { isCollapsed } = useSidebar()
    return (
      <h4
        ref={ref}
        className={cn(
          "mb-2 px-3 text-sm font-semibold text-muted-foreground",
          isCollapsed && "text-center text-xs",
          className
        )}
        {...props}
      >
        {children}
      </h4>
    )
  }
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

interface SidebarGroupContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarGroupContent = React.forwardRef<HTMLDivElement, SidebarGroupContentProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1", className)} {...props}>
      {children}
    </div>
  )
)
SidebarGroupContent.displayName = "SidebarGroupContent"

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarMenu = React.forwardRef<HTMLDivElement, SidebarMenuProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("grid gap-1", className)} {...props}>
      {children}
    </div>
  )
)
SidebarMenu.displayName = "SidebarMenu"

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const SidebarMenuItem = React.forwardRef<HTMLDivElement, SidebarMenuItemProps>(
  ({ children, className, ...props }, ref) => (
    <div ref={ref} className={cn("grid", className)} {...props}>
      {children}
    </div>
  )
)
SidebarMenuItem.displayName = "SidebarMenuItem"

interface SidebarMenuButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  children: React.ReactNode
  isActive?: boolean
}

const SidebarMenuButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  SidebarMenuButtonProps
>(({ children, className, isActive = false, size = "default", ...props }, ref) => {
  const { isCollapsed } = useSidebar()

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            ref={ref}
            variant={isActive ? "secondary" : "ghost"}
            size={isCollapsed ? "icon" : size}
            className={cn(
              "h-9 w-full justify-start",
              isCollapsed && "h-9 w-9",
              className
            )}
            {...props}
          >
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child)) {
                if (child.type === "svg") {
                  return React.cloneElement(child, {
                    className: cn("h-4 w-4", isCollapsed ? "mr-0" : "mr-2", child.props.className),
                  })
                }
                if (typeof child.props.children === "string") {
                  return (
                    <span className={cn(isCollapsed ? "sr-only" : "opacity-100")}>
                      {child.props.children}
                    </span>
                  )
                }
              }
              return child
            })}
          </Button>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-4">
            {React.Children.map(children, (child) => {
              if (React.isValidElement(child) && typeof child.props.children === "string") {
                return <span>{child.props.children}</span>
              }
              return null
            })}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
})
SidebarMenuButton.displayName = "SidebarMenuButton"

interface SidebarTriggerProps extends React.ComponentPropsWithoutRef<typeof Button> {
  children?: React.ReactNode
}

const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  SidebarTriggerProps
>(({ children, className, size = "icon", ...props }, ref) => {
  const { toggleCollapse } = useSidebar()
  return (
    <Button
      ref={ref}
      variant="ghost"
      size={size}
      onClick={toggleCollapse}
      className={cn("h-9 w-9", className)}
      {...props}
    >
      {children}
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"
