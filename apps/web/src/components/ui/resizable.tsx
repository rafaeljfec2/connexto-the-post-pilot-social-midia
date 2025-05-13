import * as React from "react"
import { cn } from "@/lib/utils"

// Estrutura baseada no padrão shadcn/ui para resizable
// Não há um pacote Radix oficial, então usamos um padrão flexível

interface ResizableProps extends React.HTMLAttributes<HTMLDivElement> {
  direction?: "horizontal" | "vertical"
  min?: number
  max?: number
  initial?: number
}

export function Resizable({
  direction = "horizontal",
  min = 100,
  max = 600,
  initial = 200,
  className,
  children,
  ...props
}: Readonly<ResizableProps>) {
  const [size, setSize] = React.useState(initial)
  const dragging = React.useRef(false)

  React.useEffect(() => {
    function onMove(e: MouseEvent) {
      if (!dragging.current) return
      if (direction === "horizontal") {
        setSize(() => {
          const next = Math.min(Math.max(e.clientX - (e.target as HTMLElement).getBoundingClientRect().left, min), max)
          return next
        })
      } else {
        setSize(() => {
          const next = Math.min(Math.max(e.clientY - (e.target as HTMLElement).getBoundingClientRect().top, min), max)
          return next
        })
      }
    }
    function onUp() {
      dragging.current = false
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
    if (dragging.current) {
      window.addEventListener("mousemove", onMove)
      window.addEventListener("mouseup", onUp)
    }
    return () => {
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("mouseup", onUp)
    }
  }, [direction, min, max])

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault()
    dragging.current = true
  }

  return (
    <div
      className={cn(
        "relative flex bg-muted/30",
        direction === "horizontal" ? "flex-row" : "flex-col",
        className
      )}
      style={direction === "horizontal" ? { width: size } : { height: size }}
      {...props}
    >
      <div className="flex-1 overflow-auto">{children}</div>
      <div
        className={cn(
          "absolute z-10 bg-border transition-colors hover:bg-primary/30",
          direction === "horizontal"
            ? "right-0 top-0 h-full w-2 cursor-col-resize"
            : "bottom-0 left-0 w-full h-2 cursor-row-resize"
        )}
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation={direction}
        tabIndex={0}
      />
    </div>
  )
} 