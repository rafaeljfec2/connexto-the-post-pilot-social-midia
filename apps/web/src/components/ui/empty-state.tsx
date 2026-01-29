import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LucideIcon, FileText } from 'lucide-react'

interface EmptyStateProps {
  readonly icon?: LucideIcon
  readonly title: string
  readonly description?: string
  readonly actionLabel?: string
  readonly onAction?: () => void
  readonly className?: string
}

export function EmptyState({
  icon: Icon = FileText,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <Card className={className}>
      <CardContent className="flex flex-col items-center gap-4 py-12">
        <div className="rounded-full bg-muted p-4">
          <Icon className="size-8 text-muted-foreground" />
        </div>
        <div className="max-w-sm space-y-1.5 text-center">
          <p className="font-medium text-foreground">{title}</p>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actionLabel && onAction && (
          <Button onClick={onAction} className="mt-2">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
