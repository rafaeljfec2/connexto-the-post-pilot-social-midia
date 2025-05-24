import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Edit, Send, Trash2 } from 'lucide-react'

interface PendingPostCardProps {
  input: string
  output: string
  model: string
  usage: {
    completion_tokens: number
    completion_tokens_details: {
      accepted_prediction_tokens: number
      audio_tokens: number
      reasoning_tokens: number
      rejected_prediction_tokens: number
    }
    prompt_tokens: number
    prompt_tokens_details: {
      audio_tokens: number
      cached_tokens: number
    }
    total_tokens: number
  }
  status: string
  createdAt: string
  onEdit?: () => void
  onSchedule?: () => void
  onPublish?: () => void
  onDelete?: () => void
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
                <Calendar className="h-4 w-4" />
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
          {output}
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>Prompt tokens: {usage.prompt_tokens}</span>
          <span>Completion tokens: {usage.completion_tokens}</span>
          <span>Total tokens: {usage.total_tokens}</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:gap-2">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={onSchedule}>
          Agendar
        </Button>
        {status === 'Pendente' && (
          <Button
            className="w-full bg-green-600 text-white hover:bg-green-700 sm:w-auto"
            onClick={onPublish}
          >
            <Send className="mr-2 h-4 w-4" /> Publicar
          </Button>
        )}
        <Button variant="destructive" className="w-full sm:w-auto" onClick={onDelete}>
          <Trash2 className="mr-2 h-4 w-4" /> Excluir
        </Button>
      </CardFooter>
    </Card>
  )
}
