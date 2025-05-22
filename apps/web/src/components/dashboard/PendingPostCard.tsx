import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Edit, Send, Trash2 } from 'lucide-react'
import { ReactNode } from 'react'

interface PendingPostCardProps {
  content: string
  status: string
  createdAt: string
  scheduledFor?: string
  socialMedias: string[]
  onEdit?: () => void
  onSchedule?: () => void
  onPublish?: () => void
  onDelete?: () => void
}

const socialIcons: Record<string, ReactNode> = {
  linkedin: <span className="font-bold text-blue-700">in</span>,
  instagram: <span className="font-bold text-pink-500">📸</span>,
  twitter: <span className="font-bold text-sky-500">𝕏</span>,
  facebook: <span className="font-bold text-blue-600">f</span>,
}

export function PendingPostCard({
  content,
  status,
  createdAt,
  scheduledFor,
  socialMedias,
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
            <CardTitle className="line-clamp-2 text-base sm:text-lg md:text-xl">
              {content}
            </CardTitle>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {createdAt}
              </div>
              {scheduledFor && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Agendado para {scheduledFor}
                </div>
              )}
            </div>
          </div>
          <Badge variant="secondary">{status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex flex-wrap gap-2">
          {socialMedias.map(social => (
            <Badge key={social} variant="outline" className="text-sm">
              {socialIcons[social] ?? social}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 border-t bg-muted/50 p-4 sm:flex-row sm:gap-2">
        <Button variant="outline" className="w-full sm:w-auto" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </Button>
        <Button variant="outline" className="w-full sm:w-auto" onClick={onSchedule}>
          <Clock className="mr-2 h-4 w-4" /> Agendar
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
