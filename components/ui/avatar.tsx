import * as React from "react"

function Avatar({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar"
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className || ""}`}
      {...props}
    />
  )
}

function AvatarFallback({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="avatar-fallback"
      className={`flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium ${className || ""}`}
      {...props}
    />
  )
}

export { Avatar, AvatarFallback }