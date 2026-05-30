import * as React from "react"

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={`bg-destructive/10 text-destructive p-3 rounded-lg text-sm ${className || ""}`}
      {...props}
    />
  )
}

function AlertDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="alert-description"
      className={`text-sm [&_p]:leading-relaxed ${className || ""}`}
      {...props}
    />
  )
}

export { Alert, AlertDescription }