import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Edit, Send, Trash2 } from 'lucide-react'

interface PendingPostCardProps {
  readonly input: string
  readonly output: string
  readonly model: string
  readonly usage?: {
    readonly completion_tokens?: number
    readonly completion_tokens_details?: {
      readonly accepted_prediction_tokens?: number
      readonly audio_tokens?: number
      readonly reasoning_tokens?: number
      readonly rejected_prediction_tokens?: number
    }
    readonly prompt_tokens?: number
    readonly prompt_tokens_details?: {
      readonly audio_tokens?: number
      readonly cached_tokens?: number
    }
    readonly total_tokens?: number
  } | null
  readonly status: string
  readonly createdAt: string
  readonly onEdit?: () => void
  readonly onSchedule?: () => void
  readonly onPublish?: () => void
  readonly onDelete?: () => void
}

export function PendingPostCard({
  input,
  output,
  model,
  usage,
  status,
  createdAt,
  onEdit,
  onSchedule,
  onPublish,
  onDelete,
}: PendingPostCardProps) {
  return (
    <Card className="flex flex-col bg-card transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="line-clamp-2 text-base sm:text-lg md:text-xl">{input}</CardTitle>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="size-4" />
                {createdAt}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{model}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary">{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-2">
        <div className="whitespace-pre-line border-l-2 border-primary/30 pl-2 text-sm text-muted-foreground">
          {output || 'Nenhum conteúdo gerado'}
        </div>
        {usage && (
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {usage.prompt_tokens !== undefined && <span>Prompt tokens: {usage.prompt_tokens}</span>}
            {usage.completion_tokens !== undefined && (
              <span>Completion tokens: {usage.completion_tokens}</span>
            )}
            {usage.total_tokens !== undefined && <span>Total tokens: {usage.total_tokens}</span>}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:gap-2">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onEdit}>
          <Edit className="mr-2 size-4" /> Editar
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={onSchedule}>
          Agendar
        </Button>
        {status === 'Pendente' && (
          <Button
            className="w-full bg-success text-success-foreground hover:bg-success/90 sm:w-auto"
            onClick={onPublish}
          >
            <Send className="mr-2 size-4" /> Publicar
          </Button>
        )}
        <Button variant="destructive" className="w-full sm:w-auto" onClick={onDelete}>
          <Trash2 className="mr-2 size-4" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  )
}
