import { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface HistoryKpiCardProps {
  title: string
  value: string | number
  icon?: ReactNode
}

export function HistoryKpiCard({ title, value, icon }: Readonly<HistoryKpiCardProps>) {
  return (
    <Card className="flex flex-row items-center gap-3 border bg-muted p-3 shadow-none sm:p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <CardContent className="flex flex-col p-0">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <span className="text-lg font-bold leading-tight md:text-xl">{value}</span>
      </CardContent>
    </Card>
  )
}
