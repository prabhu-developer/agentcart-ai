"use client"

import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-emerald-600" />
        ),
        info: (
          <InfoIcon className="size-4 text-teal-600" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4 text-amber-600" />
        ),
        error: (
          <OctagonXIcon className="size-4 text-rose-600" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin text-teal-600" />
        ),
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#202522",
          "--normal-border": "#e8ece9",
          "--border-radius": "0.625rem",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast shadow-md border border-[#e8ece9] bg-white text-[#202522]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
